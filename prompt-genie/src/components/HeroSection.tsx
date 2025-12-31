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
            Describe what you want to build.{" "}
            <span className="italic text-[#D5451B]">We'll handle the prompt.</span>
          </h1>

          {/* Subheading - calm, confident */}
          <p
            className="font-body text-md md:text-lg text-muted-foreground max-w-xl mx-auto mb-12 leading-relaxed animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            From AI agents to complex workflows — generate prompts crafted for every major AI model.
          </p>

          {/* Primary CTA - Liquid glass button */}
          <div
            className="mb-6 animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            <LiquidButton
              size="xl"
              onClick={scrollToGenerator}
              className="group"
            >
              Get Started for Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </LiquidButton>
          </div>

          {/* Secondary microcopy */}
          <p
            className="font-body text-sm text-muted-foreground/70 animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            No login. No friction. Just prompts.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;