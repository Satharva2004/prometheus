import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  const scrollToGenerator = () => {
    document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center py-12">
      <div className="container mx-auto px-6 relative z-10 mt-32">
        <div className="max-w-3xl mx-auto text-center">
          {/* Main editorial headline */}
          <h1
            className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.1] mb-8 animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            Creating system prompt for your AI agent <br className="hidden ml-2" />
            <span className="italic text-[#D5451B]">Made Easy.</span>
          </h1>

          {/* Subheading */}
          <p
            className="font-body text-md md:text-lg text-muted-foreground max-w-xl mx-auto mb-12 leading-relaxed animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            We've reverse-engineered the system prompts behind Google, OpenAI, and Anthropic. Our RAG engine retrieves these elite architectural patterns to engineer the perfect instructions for <i>your</i> agent.
          </p>

          {/* Primary CTA */}
          <div
            className="mb-4 animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            <LiquidButton
              size="xl"
              onClick={scrollToGenerator}
              className="group"
            >
              Start Engineering — Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </LiquidButton>
          </div>

          {/* Secondary microcopy */}
          <p
            className="font-body text-sm text-muted-foreground/70 animate-fade-in-up flex items-center justify-center gap-2"
            style={{ animationDelay: '0.4s' }}
          >
            No sign up required. Open Source.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;