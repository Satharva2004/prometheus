const steps = [
  {
    number: "01",
    title: "Describe your idea",
    description: "Tell us about the AI agent, workflow, or system you want to create.",
  },
  {
    number: "02",
    title: "We translate it for each AI",
    description: "Our system generates optimized prompts tailored to each platform's strengths.",
  },
  {
    number: "03",
    title: "Copy & build",
    description: "Take your prompts and start building with confidence.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 border-t border-border/30">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl text-foreground text-center mb-16">
            How it Works
          </h2>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div 
                key={step.number}
                className="flex gap-6 items-start animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="font-display text-2xl text-muted-foreground/40 shrink-0 w-12">
                  {step.number}
                </span>
                <div>
                  <h3 className="font-display text-xl text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;