import { LiquidButton } from "@/components/ui/liquid-glass-button";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-sm border-b border-border/30">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl text-foreground tracking-tight">
            PromptForge
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a 
            href="#generator" 
            className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Generator
          </a>
          <a 
            href="#how-it-works" 
            className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            How it Works
          </a>
          <a 
            href="#models" 
            className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Models
          </a>
        </nav>

        <LiquidButton size="sm" className="hidden sm:flex">
          Get Started
        </LiquidButton>
      </div>
    </header>
  );
};

export default Header;