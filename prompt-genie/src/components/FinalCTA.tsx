import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { ArrowRight } from "lucide-react";

const FinalCTA = () => {
  const scrollToGenerator = () => {
    document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-32 border-t border-border/30">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-8 leading-tight">
            Good prompts feel written,{" "}
            <span className="italic text-muted-foreground">not generated.</span>
          </h2>

          <LiquidButton 
            size="xl" 
            onClick={scrollToGenerator}
            className="group"
          >
            Get Started for Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </LiquidButton>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;