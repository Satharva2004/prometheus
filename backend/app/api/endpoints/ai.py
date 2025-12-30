from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import itertools
from groq import Groq
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer

router = APIRouter()

# --- Configuration ---
PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")
PINECONE_INDEX_NAME = "quickstart"
PINECONE_NAMESPACE = "promptsdb"

# --- Key Rotation Setup ---
api_keys = []
for i in range(1, 2):
    key = os.environ.get(f"GROQ_API_KEY_{i}")
    if key:
        api_keys.append((key, f"GROQ_API_KEY_{i}"))

if not api_keys:
    print("Warning: No GROQ_API_KEY_1...6 found.")

key_cycle = itertools.cycle(api_keys)

def get_groq_client():
    if not api_keys:
        raise HTTPException(status_code=500, detail="No GROQ_API_KEYs configured")
    current_key, key_name = next(key_cycle)
    print(f"Using API Key: {key_name}")
    return Groq(api_key=current_key)

# --- RAG Setup (Lazy Loading) ---
embedding_model = None
pinecone_index = None

def get_embedding_model():
    global embedding_model
    if embedding_model is None:
        print("Loading SentenceTransformer model...")
        embedding_model = SentenceTransformer('all-mpnet-base-v2')
    return embedding_model

def get_pinecone_index():
    global pinecone_index
    if pinecone_index is None:
        if not PINECONE_API_KEY:
             # Should ideally handle this gracefully or fail start
             print("Warning: PINECONE_API_KEY not set.")
             return None
        pc = Pinecone(api_key=PINECONE_API_KEY)
        pinecone_index = pc.Index(PINECONE_INDEX_NAME)
    return pinecone_index

# --- Data Models ---
class FollowUpQuestion(BaseModel):
    id: int
    question: str
    options: List[str]

class FollowUpResponse(BaseModel):
    questions: List[FollowUpQuestion]

class QueryRequest(BaseModel):
    query: str

class GenerateDetailedPromptRequest(BaseModel):
    query: str
    answers: List[dict] # [{"id": 1, "answer": "Friendly"}, ...]

class GeneratedPromptResponse(BaseModel):
    final_prompt: str
    retrieved_sources: List[str] = []

# --- Endpoints ---

@router.post("/analyze-query", response_model=FollowUpResponse)
async def analyze_query(request: QueryRequest):
    """
    Analyzes the user's query and generates 3-4 follow-up questions 
    with options to refine the prompt intent.
    """
    client = get_groq_client()
    if not client.api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")

    system_prompt = """
    You are a senior prompt engineer and conversation designer.

    Your task is to analyze the user’s input prompt and generate clarifying follow-up questions that would meaningfully improve the final prompt quality.

    Guidelines:
    - Generate exactly 3 or 4 questions (no more, no less).
    - Each question must focus on a different dimension, such as:
      - intent or goal
      - tone or style
      - output format or structure
      - constraints, tools, or audience
    - Each question must include 3 to 4 clearly distinct options.
    - Options should be concrete, mutually exclusive where possible, and actionable.
    - Do NOT ask vague or redundant questions.
    - Do NOT invent context beyond what the user provided.

    Output Rules:
    - Return ONLY valid JSON.
    - Do NOT include explanations, comments, markdown, or extra text.
    - Follow the schema exactly.
    - IDs must be sequential integers starting from 1.
        
    Return the output STRICTLY in the following JSON format:
    {
      "questions": [
        {
          "id": 1,
          "question": "What is the desired tone?",
          "options": ["Formal", "Casual", "Humorous", "Authoritative"]
        },
        ...
      ]
    }
    
    Do not add any text outside the JSON.
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": request.query,
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=1024,
            top_p=1,
            stop=None,
            stream=False,
            response_format={"type": "json_object"}
        )

        content = chat_completion.choices[0].message.content
        if not content:
             raise ValueError("Empty response from AI")

        # Parse JSON
        data = json.loads(content)
        
        # Validate structure (basic check)
        if "questions" not in data:
            raise ValueError("Invalid JSON structure returned")

        return data

    except Exception as e:
        print(f"Error calling Groq: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-final-prompt", response_model=GeneratedPromptResponse)
async def generate_final_prompt(request: GenerateDetailedPromptRequest):
    """
    Takes the original query and the answers to the follow-up questions
    to generate a comprehensive, high-quality prompt causing RAG.
    """
    client = get_groq_client()
    if not client.api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")
        
    # 1. Retrieve Reference Prompts via RAG
    retrieved_prompts_text = "No reference prompts found."
    retrieved_sources = []
    try:
        embed_model = get_embedding_model()
        index = get_pinecone_index()
        
        if embed_model and index:
            # Create embedding for the query
            xq = embed_model.encode(request.query).tolist()
            
            # Query Pinecone
            matches = index.query(
                vector=xq, 
                top_k=6, 
                include_metadata=True, 
                namespace=PINECONE_NAMESPACE
            )
            
            if matches and matches.get('matches'):
                retrieved_prompts_text = ""
                for i, match in enumerate(matches['matches']):
                    text = match['metadata'].get('text', 'N/A')
                    source = match['metadata'].get('source_path', 'Unknown')
                    score = match.get('score', 0)
                    retrieved_prompts_text += f"[Reference {i+1} (Score: {score:.2f})]:\n{text}\n\n"
                    if source not in retrieved_sources:
                        retrieved_sources.append(source)
    except Exception as e:
        print(f"RAG Retrieval Error: {e}")
        # Continue without RAG if it fails
        pass

    # 2. Construct System Prompt (User Provided)
    system_prompt = """
    You are a master prompt engineer and system prompt architect.

    You have access to a knowledge base containing over 100 high-quality system prompts from leading AI systems (e.g., OpenAI, Claude, Gemini, Anthropic-style agents). These prompts represent best practices in instruction hierarchy, safety, reasoning guidance, and style control.

    Your task is to synthesize a NEW, ORIGINAL system prompt tailored to the user’s needs by:
    - Understanding the user’s original idea
    - Incorporating their answers to clarifying questions
    - Abstracting patterns and techniques from retrieved system prompts
    - NOT copying or directly referencing any existing prompt verbatim

    The output must be a single, cohesive SYSTEM PROMPT that is immediately usable in an LLM.

    ---

    ### INPUTS YOU WILL RECEIVE
    1. User’s original idea or goal
    2. User’s selected answers to clarifying questions
    3. Retrieved reference system prompts (for inspiration only)

    ---

    ### GENERATION RULES (CRITICAL)
    - Produce ONE final system prompt only
    - Do NOT mention RAG, databases, or reference prompts
    - Do NOT cite or name OpenAI, Claude, Gemini, or any company
    - Do NOT include explanations, analysis, or commentary
    - Do NOT ask follow-up questions
    - Use clear instruction hierarchy and unambiguous language
    - Optimize for correctness, safety, and controllability

    ---

    ### STRUCTURE GUIDELINES
    Use the following sections **only if they add value**:

    1. **Role / Identity**
    - Define the assistant’s role and expertise clearly

    2. **Context**
    - Relevant background or operating environment

    3. **Primary Task**
    - What the model must do, stated precisely

    4. **Constraints & Boundaries**
    - What the model must avoid or prioritize
    - Output limits, safety, accuracy, tools, or scope

    5. **Reasoning & Behavior Rules**
    - How the model should think, decide, or respond
    - Step-by-step reasoning, verification, or refusal behavior (if needed)

    6. **Style & Tone**
    - Tone, verbosity, formatting, or audience alignment

    7. **Output Requirements**
    - Exact format, structure, or validation rules

    ---

    ### QUALITY BAR
    The generated system prompt should:
    - Match the clarity and rigor of top-tier AI system prompts
    - Be robust across edge cases
    - Reduce hallucinations and ambiguity
    - Be reusable and scalable for repeated interactions

    ---

    ### FINAL OUTPUT RULE
    Return ONLY the final system prompt text and present it well formatted.
    """

    # 3. Construct User Content string
    clarifications_str = ""
    for ans in request.answers:
        clarifications_str += f"- {ans.get('answer', 'N/A')}\n"

    user_content = f"""
    1. User’s Original Idea or Goal:
    {request.query}

    2. User’s Selected Answers to Clarifying Questions:
    {clarifications_str}

    3. Retrieved Reference System Prompts:
    {retrieved_prompts_text}
    
    Based on this, generate the BEST possible final prompt.
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_content,
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.25,
            max_tokens=8192,
        )

        final_prompt = chat_completion.choices[0].message.content
        return {"final_prompt": final_prompt, "retrieved_sources": retrieved_sources}

    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))
