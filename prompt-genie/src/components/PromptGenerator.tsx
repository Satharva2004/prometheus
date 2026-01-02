import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, RefreshCcw, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { AnimatePresence, motion } from "framer-motion";
import { useUser, SignInButton } from "@clerk/clerk-react"; // Start Clerk imports

interface Question {
  id: number;
  question: string;
  options: string[];
}

// -----------------------------------------------------
// Breathing Orb Component
// -----------------------------------------------------
const BreathingOrb = ({ size = "lg" }: { size?: "sm" | "lg" }) => {
  const isSmall = size === "sm";

  // Dimensions - scaled up for lg
  const containerSize = isSmall ? "w-5 h-5" : "w-64 h-64";
  const coreBlur = isSmall ? "blur-sm" : "blur-3xl";
  const innerBlur = isSmall ? "blur-[2px]" : "blur-xl";

  return (
    <div className={`relative flex items-center justify-center ${containerSize}`}>
      {/* Core Gradient Orb */}
      <motion.div
        className={`absolute w-full h-full rounded-full ${coreBlur}`}
        style={{
          background: "radial-gradient(circle, hsla(25, 95%, 40%, 0.95) 0%, hsla(30, 80%, 50%, 0.1) 60%, transparent 80%)",
        }}
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Inner Glow */}
      <motion.div
        className={`absolute w-2/3 h-2/3 rounded-full ${innerBlur}`}
        style={{
          background: "radial-gradient(circle, hsla(40, 100%, 80%, 0.9) 0%, transparent 70%)",
        }}
        animate={{
          scale: [0.9, 1.1, 0.9],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.1
        }}
      />
    </div>
  );
};

const PromptGenerator = () => {
  const { isSignedIn } = useUser();
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<"initial" | "clarifying" | "final">("initial");

  // Q&A State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Result State
  const [finalPrompt, setFinalPrompt] = useState("");
  const [retrievedSources, setRetrievedSources] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // Usage Limit State
  const [hasUsedFreeToken, setHasUsedFreeToken] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    // Check if user has already used their free generation
    const used = localStorage.getItem("prometheus_free_usage");
    if (used) {
      setHasUsedFreeToken(true);
    }

    // Restore pending state if exists (e.g. after reload/signup)
    const pending = localStorage.getItem("prometheus_pending_generation");
    if (pending) {
      try {
        const parsed = JSON.parse(pending);
        setInput(parsed.input || "");
        setFinalPrompt(parsed.finalPrompt || "");
        setRetrievedSources(parsed.retrievedSources || []);
        setQuestions(parsed.questions || []);
        setAnswers(parsed.answers || {});
        // If we have a final prompt, go to final step
        if (parsed.finalPrompt) {
          setStep("final");
        } else if (parsed.questions?.length > 0) {
          // If we had questions but no final prompt, maybe restore clarifying?
          // For now, let's focus on restoring the final result which is the main pain point
          setStep("clarifying");
          setCurrentQIndex(Object.keys(parsed.answers || {}).length);
        }
      } catch (e) {
        console.error("Failed to parse pending generation", e);
      }
    }
  }, []);

  const handleAnalyze = async () => {
    if (!input.trim()) {
      toast({
        title: "Please describe your AI agent",
        description: "Enter a description of the AI agent or workflow you want to build.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(`https://prometheus.publicvm.com/api/ai/analyze-query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });

      if (!response.ok) throw new Error("Failed to analyze query");

      const data = await response.json();
      if (data.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions);
        setAnswers({});
        setCurrentQIndex(0);
        setStep("clarifying");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptionSelect = (qId: number, option: string) => {
    setAnswers(prev => ({ ...prev, [qId]: option }));

    // Auto advance after a brief delay for animation
    setTimeout(() => {
      if (currentQIndex < questions.length - 1) {
        setCurrentQIndex(prev => prev + 1);
      } else {
        // All questions answered, generate final prompt
        handleGenerateFinal({ ...answers, [qId]: option });
      }
    }, 400);
  };

  const handleGenerateFinal = async (finalAnswers: Record<number, string>) => {
    setIsGenerating(true);
    setStep("final");

    try {
      const formattedAnswers = Object.entries(finalAnswers).map(([id, answer]) => ({
        id: parseInt(id),
        answer,
      }));

      const response = await fetch(`https://prometheus.publicvm.com/api/ai/generate-final-prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: input,
          answers: formattedAnswers,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate final prompt");

      const data = await response.json();
      setFinalPrompt(data.final_prompt);
      setRetrievedSources(data.retrieved_sources || []);

      // Save state for recovery after signup/reload
      localStorage.setItem("prometheus_pending_generation", JSON.stringify({
        input,
        finalPrompt: data.final_prompt,
        retrievedSources: data.retrieved_sources || [],
        questions,
        answers: finalAnswers,
        timestamp: Date.now()
      }));

      // Mark free token as used if not signed in
      if (!isSignedIn && !hasUsedFreeToken) {
        localStorage.setItem("prometheus_free_usage", "true");
        setHasUsedFreeToken(true);
      }

    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to generate the final prompt.",
        variant: "destructive",
      });
      setStep("clarifying"); // Go back on error
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(finalPrompt);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "The prompt is ready to use.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const resetProcess = () => {
    setInput("");
    setQuestions([]);
    setAnswers({});
    setCurrentQIndex(0);
    setFinalPrompt("");
    setRetrievedSources([]);
    setStep("initial");
    localStorage.removeItem("prometheus_pending_generation");
  };

  const currentQuestion = questions[currentQIndex];

  // Determine if content should be locked (second try, not signed in)
  const isLocked = !isSignedIn && hasUsedFreeToken && step === "final" && !isGenerating;

  return (
    <section id="generator" className="py-24 min-h-screen relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4 relative z-10">
              {step === "initial" && "Define Agent Behavior"}
              {step === "clarifying" && "Calibrate Specifics"}
              {step === "final" && !isGenerating && "Operational Context Ready"}
              {step === "final" && isGenerating && "Synthesizing Architecture..."}
            </h2>
            <p className="font-body text-muted-foreground text-lg relative z-10">
              {step === "initial" && "Articulate the core purpose and we'll help you refine the logic."}
              {step === "clarifying" && "Select the best fit to handle edge cases and nuances."}
              {step === "final" && !isGenerating && "Deploy this system prompt to your LLM configuration."}
              {step === "final" && isGenerating && "Aligning constraints and optimizing token structure."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: INITIAL INPUT */}
            {step === "initial" && (
              <motion.div
                key="step-initial"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                transition={{ duration: 0.4 }}
                className="bg-card rounded-2xl shadow-card border border-border/50 p-6 md:p-8"
              >
                <Textarea
                  placeholder="Describe the Agent's Role, Context, and any specific constraints..."
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
                    onClick={handleAnalyze}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <div className="mr-3">
                          <BreathingOrb size="sm" />
                        </div>
                        Analyzing...
                      </>
                    ) : (
                      "Initialize Analysis"
                    )}
                  </LiquidButton>
                </div>
              </motion.div>
            )}

            {/* STEP 2: CLARIFYING QUESTIONS (SEQUENTIAL) */}
            {step === "clarifying" && currentQuestion && (
              <motion.div
                key={`q-${currentQuestion.id}`} // Unique key for each question triggers AnimatePresence
                initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{
                  opacity: 0,
                  scale: 1.1,
                  filter: "blur(20px)",
                  transition: { duration: 0.4, ease: "easeInOut" }
                }}
                className="bg-card rounded-xl border border-border/40 p-8 shadow-sm max-w-2xl mx-auto"
              >
                <div className="mb-6">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    Question {currentQIndex + 1} of {questions.length}
                  </span>
                  <h3 className="font-display text-2xl text-foreground mt-2">
                    {currentQuestion.question}
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleOptionSelect(currentQuestion.id, option)}
                      className="px-5 py-4 rounded-xl text-base font-body text-left transition-all duration-300 border bg-secondary/30 border-transparent text-foreground hover:bg-primary/5 hover:border-primary/30 hover:shadow-lg active:scale-[0.98]"
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="mt-8 h-1 w-full bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: `${(currentQIndex / questions.length) * 100}%` }}
                    animate={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </motion.div>
            )}

            {/* Loading State - Breathing Orb Centered */}
            {step === "final" && isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 min-h-[400px]"
              >
                <BreathingOrb size="lg" />
              </motion.div>
            )}

            {/* STEP 3: FINAL OUTPUT (EDITABLE) */}
            {step === "final" && !isGenerating && (
              <motion.div
                key="step-final"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", bounce: 0.3 }}
                className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden relative"
              >
                <div className="border-b border-border/50 px-6 py-4 flex items-center justify-between bg-secondary/10">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-medium text-foreground">System Prompt</span>
                    {!isLocked && (
                      <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold tracking-wider uppercase border border-green-500/20">
                        Optimized
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={resetProcess}
                      className="p-2 hover:bg-secondary/50 rounded-md transition-colors text-muted-foreground hover:text-foreground"
                      title="Start Over"
                    >
                      <RefreshCcw className="w-4 h-4" />
                    </button>
                    {!isLocked && (
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/60 border border-border/50 font-body text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <Textarea
                    value={isLocked ? "This content is hidden. Please sign in to view your optimized prompt." : finalPrompt}
                    onChange={(e) => !isLocked && setFinalPrompt(e.target.value)}
                    className={`min-h-[500px] w-full p-6 font-mono text-sm leading-relaxed bg-transparent border-0 focus-visible:ring-0 resize-y ${isLocked ? "blur-md select-none pointer-events-none" : ""}`}
                    spellCheck={false}
                    disabled={isLocked}
                  />

                  {/* Lock Overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/20 backdrop-blur-[2px] z-20">
                      <div className="bg-card border border-border p-8 rounded-2xl shadow-elevated flex flex-col items-center text-center max-w-sm">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <Lock className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-display text-xl text-foreground mb-2">Unlock Your Prompt</h3>
                        <p className="font-body text-sm text-muted-foreground mb-6">
                          You've used your free generation. Sign up to reveal this prompt and create unlimited AI agents.
                        </p>
                        <SignInButton mode="modal">
                          <LiquidButton size="lg" className="w-full">
                            Sign Up to Reveal
                          </LiquidButton>
                        </SignInButton>
                      </div>
                    </div>
                  )}
                </div>

                {retrievedSources.length > 0 && !isLocked && (
                  <div className="bg-secondary/5 border-t border-border/30 p-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                      Inspired by Knowledge Base
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {retrievedSources.map((source, idx) => (
                        <span key={idx} className="px-2 py-1 rounded bg-secondary/40 text-[10px] text-muted-foreground border border-border/20">
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default PromptGenerator;