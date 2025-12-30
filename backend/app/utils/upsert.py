import os
import glob
from pathlib import Path
from dotenv import load_dotenv
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer
from transformers import pipeline
from keybert import KeyBERT
import torch

# === CONFIGURATION ===
CURRENT_DIR = Path(__file__).parent
ENV_PATH = CURRENT_DIR.parent.parent / ".env"
load_dotenv(ENV_PATH)

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = "quickstart"
NAMESPACE = "promptsdb"
BATCH_SIZE = 50 # Smaller batch size due to larger metadata/embeddings

# Chunking Configuration
CHUNK_SIZE = 400 # tokens (target between 300-500)
CHUNK_OVERLAP = 75 # tokens (target between 50-100)

DATA_DIR = CURRENT_DIR.parent.parent / "system-prompts-and-models-of-ai-tools"

def chunk_text(text, tokenizer, chunk_size, overlap):
    """
    Splits text into chunks of `chunk_size` tokens with `overlap`.
    Uses the tokenizer from the embedding model to ensure accuracy.
    """
    # truncation=False allows us to get the full list of tokens for manual chunking
    # add_special_tokens=False because we just want the content tokens now; 
    # the embedding model will add CLS/SEP later to the chunks.
    tokens = tokenizer.encode(text, add_special_tokens=False, truncation=False)
    
    chunks = []
    start = 0
    total_tokens = len(tokens)
    
    if total_tokens <= chunk_size:
        return [text]

    while start < total_tokens:
        # Calculate end index
        end = min(start + chunk_size, total_tokens)
        
        # Decode the chunk of tokens back to string
        chunk_tokens = tokens[start:end]
        chunk_str = tokenizer.decode(chunk_tokens, skip_special_tokens=True)
        chunks.append(chunk_str)
        
        # Stop if we've reached the end
        if end == total_tokens:
            break
            
        # Move start pointer forward by (size - overlap)
        start += (chunk_size - overlap)
        
    return chunks

def upsert_data():
    if not PINECONE_API_KEY:
        print("Error: PINECONE_API_KEY not found.")
        return

    # 1. Initialize Pinecone
    print("Initializing Pinecone...")
    try:
        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index(PINECONE_INDEX_NAME)
    except Exception as e:
        print(f"Pinecone connection error: {e}")
        return

    # 2. Load Models
    print("Loading AI Models (this may take a while)...")
    try:
        # Embedding Model - switched to 768 dimensions to match Pinecone index
        # 'all-mpnet-base-v2' maps sentences to a 768 dimensional dense vector space
        embed_model = SentenceTransformer('all-mpnet-base-v2')
        # We use the embedding model's tokenizer for chunking consistency
        tokenizer = embed_model.tokenizer
        
        # Summarization Model (BART)
        summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
        
        # Keyword Extraction Model (KeyBERT)
        kw_model = KeyBERT(model=embed_model) # Reuse embedding model
        
    except Exception as e:
        print(f"Model loading error: {e}")
        return

    # 3. Scan Files
    print(f"Scanning {DATA_DIR}...")
    files = list(DATA_DIR.rglob("*.txt")) + list(DATA_DIR.rglob("*.json"))
    
    if not files:
        print("No files found.")
        return

    print(f"Found {len(files)} files. Processing...")

    vectors_batch = []

    for file_path in files:
        try:
            print(f"Processing: {file_path.name}")
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read().strip()
            
            if not content: continue

            # --- A. Generate File-Level Metadata ---
            
            # 1. Summarization
            # BART has a limit of 1024 tokens. Safely truncate to ~2500 chars 
            sum_input = content[:2500] 
            try:
                # We use a try-except block to ensure one failure doesn't stop the whole process
                summary_result = summarizer(sum_input, max_length=130, min_length=30, do_sample=False, truncation=True)
                summary_text = summary_result[0]['summary_text']
            except Exception as e:
                # print(f"  Summarization failed for {file_path.name}: {e}") # Reduce noise
                summary_text = ""

            # 2. Keyword Extraction
            try:
                # Extract keywords from the first 4000 chars to be faster
                kw_input = content[:4000]
                keywords_list = kw_model.extract_keywords(kw_input, keyphrase_ngram_range=(1, 2), stop_words='english', top_n=5)
                keywords = [kw[0] for kw in keywords_list]
            except Exception as e:
                # print(f"  Keyword extraction failed for {file_path.name}: {e}") # Reduce noise
                keywords = []

            # --- B. Chunking & Embedding ---
            
            # Ensure proper truncation happens inside chunk_text if needed, but here we manually chunk
            text_chunks = chunk_text(content, tokenizer, CHUNK_SIZE, CHUNK_OVERLAP)
            
            for idx, chunk in enumerate(text_chunks):
                # Embed the chunk
                embedding = embed_model.encode(chunk).tolist()

                
                # ID: filename_chunkIndex
                # Use a hash or sanitized string for ID if path is too long, but relative path is usually okay
                relative_path = file_path.relative_to(DATA_DIR).as_posix()
                
                # ASCII encode path to safe characters just in case, or keep as is.
                # Pinecone IDs strictly allow ASCII 32-126.
                safe_id = f"{relative_path}_{idx}".replace(" ", "_")

                # Metadata
                metadata = {
                    "text": chunk,
                    "filename": file_path.name,
                    "source_path": relative_path,
                    "summary": summary_text,
                    "keywords": keywords, 
                    "chunk_index": idx,
                    "total_chunks": len(text_chunks)
                }

                vectors_batch.append({
                    "id": safe_id,
                    "values": embedding,
                    "metadata": metadata
                })
            
            # --- C. Streaming Upsert ---
            # If batch is full, upsert immediately
            if len(vectors_batch) >= BATCH_SIZE:
                try:
                    print(f"  Upserting batch of {len(vectors_batch)} vectors...")
                    index.upsert(vectors=vectors_batch, namespace=NAMESPACE)
                    vectors_batch = [] # Reset batch
                except Exception as e:
                    print(f"  Error upserting batch: {e}")

        except Exception as e:
            print(f"Error processing file {file_path.name}: {e}")

    # 4. Upsert Remaining
    if vectors_batch:
        try:
            print(f"Upserting final batch of {len(vectors_batch)} vectors...")
            index.upsert(vectors=vectors_batch, namespace=NAMESPACE)
        except Exception as e:
            print(f"  Error upserting final batch: {e}")
    
    print("Processing complete!")

if __name__ == "__main__":
    upsert_data()