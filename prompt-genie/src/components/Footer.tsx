const Footer = () => {
  return (
    <footer className="py-8 border-t border-border/30">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-display text-lg text-foreground">
            PromptForge
          </span>

          <p className="font-body text-sm text-muted-foreground/60">
            Craft perfect prompts. Build with confidence.
          </p>

          <div className="flex items-center gap-6">
            <a 
              href="#" 
              className="font-body text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors duration-200"
            >
              Privacy
            </a>
            <a 
              href="#" 
              className="font-body text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors duration-200"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;