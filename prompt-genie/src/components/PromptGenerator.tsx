import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LiquidButton } from "@/components/ui/liquid-glass-button";

const samplePrompts = {
  chatgpt: `# AI Customer Support Agent for FinTech App

## Role Definition
You are an AI-powered customer support specialist for a fintech application. Your primary function is to assist users with account inquiries, transaction issues, and general platform navigation while maintaining strict compliance with financial regulations.

## Core Responsibilities
1. **Account Management**: Help users with account access, password resets, and profile updates
2. **Transaction Support**: Assist with payment inquiries, transfer status, and dispute resolution
3. **Compliance Awareness**: Ensure all responses adhere to KYC/AML regulations
4. **Escalation Protocol**: Identify complex issues requiring human intervention

## Communication Guidelines
- Maintain a professional yet friendly tone
- Never request or store sensitive information (SSN, full card numbers)
- Always verify user identity before discussing account specifics
- Provide clear, step-by-step instructions when guiding users

## Response Format
Structure responses with:
- Acknowledgment of the user's concern
- Clear explanation or solution
- Next steps or follow-up actions
- Relevant compliance disclaimers when applicable`,

  gemini: `<system_instructions>
You are a customer support AI agent integrated into a financial technology platform. Your operational parameters are defined below.

<agent_identity>
- Name: FinAssist AI
- Domain: Financial Services Support
- Compliance Level: High (Financial Regulations Apply)
</agent_identity>

<capabilities>
- Account inquiry handling
- Transaction status verification
- Payment dispute initiation
- General navigation assistance
- Security alert explanations
</capabilities>

<constraints>
- DO NOT request full social security numbers
- DO NOT store credit card information in conversation
- ALWAYS redirect fraud concerns to human agents
- MUST include regulatory disclaimers for investment-related queries
</constraints>

<interaction_protocol>
1. Greet user and verify identity through approved methods
2. Categorize inquiry type
3. Provide relevant assistance within compliance boundaries
4. Offer escalation path when necessary
5. Conclude with satisfaction check and case reference
</interaction_protocol>
</system_instructions>`,

  claude: `You are FinAssist, a specialized customer support agent for a financial technology application. Your purpose is to provide helpful, accurate, and compliant assistance to users.

## Your Character
You are knowledgeable, patient, and precise. You understand that financial matters require careful attention to detail and clear communication. You prioritize user security and regulatory compliance in every interaction.

## What You Can Help With
- Account access and authentication issues
- Understanding transaction history and statements
- Explaining fees and charges
- Guiding users through platform features
- Initiating dispute processes
- Providing general financial product information

## Important Boundaries
You must never:
• Ask for complete sensitive information (full SSN, complete card numbers)
• Provide specific investment advice
• Make promises about dispute outcomes
• Access systems beyond your authorized scope

When you encounter situations outside your capabilities, smoothly transition to human support: "I want to make sure you get the best assistance for this. Let me connect you with a specialist who can help further."

## Response Approach
Begin by acknowledging the user's situation with empathy. Provide clear, structured responses that anticipate follow-up questions. End with a confirmation that their concern has been addressed or clear next steps.`
};

const PromptGenerator = () => {
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!input.trim()) {
      toast({
        title: "Please describe your AI agent",
        description: "Enter a description of the AI agent or workflow you want to build.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    // Simulate generation
    setTimeout(() => {
      setIsGenerating(false);
      setHasGenerated(true);
      toast({
        title: "Prompts generated",
        description: "Your optimized prompts are ready.",
      });
    }, 1500);
  };

  const handleCopy = (text: string, tab: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tab);
    toast({
      title: "Copied to clipboard",
      description: "The prompt is ready to use.",
    });
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <section id="generator" className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
              Describe Your AI Agent
            </h2>
            <p className="font-body text-muted-foreground text-lg">
              Tell us what you want to build, and we'll craft the prompts.
            </p>
          </div>

          {/* Matte input card */}
          <div className="bg-card rounded-2xl shadow-card border border-border/50 p-6 md:p-8 mb-8">
            <Textarea
              placeholder="Describe the AI agent, workflow, or system you want to build…"
              className="min-h-[140px] font-body text-base resize-none border-0 bg-secondary/40 focus-visible:ring-1 focus-visible:ring-border mb-4 placeholder:text-muted-foreground/50"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <p className="font-body text-sm text-muted-foreground/60 mb-6 italic">
              e.g. 'An internal HR AI agent that answers policy questions and follows compliance rules'
            </p>

            <div className="flex items-center justify-end">
              <LiquidButton
                size="lg"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate Prompt"}
              </LiquidButton>
            </div>
          </div>

          {/* Output section - Editorial code block style */}
          {hasGenerated && (
            <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden animate-fade-in-up">
              <Tabs defaultValue="chatgpt" className="w-full">
                <div className="border-b border-border/50 px-6 pt-4">
                  <TabsList className="bg-transparent gap-1">
                    {["chatgpt", "gemini", "claude"].map((tab) => (
                      <TabsTrigger
                        key={tab}
                        value={tab}
                        className="font-body text-sm capitalize data-[state=active]:bg-secondary/60 data-[state=active]:shadow-none rounded-lg px-4"
                      >
                        {tab === "chatgpt" ? "ChatGPT" : tab.charAt(0).toUpperCase() + tab.slice(1)} Prompt
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {Object.entries(samplePrompts).map(([key, prompt]) => (
                  <TabsContent key={key} value={key} className="m-0">
                    <div className="relative">
                      <button
                        className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/60 border border-border/50 font-body text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200"
                        onClick={() => handleCopy(prompt, key)}
                      >
                        {copiedTab === key ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy Prompt
                          </>
                        )}
                      </button>
                      <pre className="p-6 pt-14 overflow-x-auto font-body text-sm text-foreground/85 bg-secondary/20 max-h-[450px] overflow-y-auto leading-relaxed whitespace-pre-wrap">
                        {prompt}
                      </pre>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PromptGenerator;