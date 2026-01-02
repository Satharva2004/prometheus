import { useState } from "react";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-sm border-b border-border/30">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl text-foreground tracking-tight">
            Prometheus
          </span>
        </div>

        {/* Desktop Nav */}
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

        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <LiquidButton size="sm" className="hidden sm:flex">
                Get Started
              </LiquidButton>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-foreground p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border/30 p-6 flex flex-col gap-6 shadow-lg animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-4">
            <a
              href="#generator"
              className="font-body text-lg text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Generator
            </a>
            <a
              href="#how-it-works"
              className="font-body text-lg text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              How it Works
            </a>
            <a
              href="#models"
              className="font-body text-lg text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Models
            </a>
          </nav>
          <SignedOut>
            <SignInButton mode="modal">
              <LiquidButton size="lg" className="w-full justify-center">
                Get Started
              </LiquidButton>
            </SignInButton>
          </SignedOut>
        </div>
      )}
    </header>
  );
};

export default Header;