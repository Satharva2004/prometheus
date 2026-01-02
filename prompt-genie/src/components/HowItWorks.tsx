const steps = [
  {
    number: "01",
    title: "Define Your Intent",
    description: "Describe the role, constraints, and desired logical flow of your AI agent or workflow.",
  },
  {
    number: "02",
    title: "Interactive Calibration",
    description: "Our system analyzes your request and asks targeted clarifying questions to cover edge cases and ambiguity.",
  },
  {
    number: "03",
    title: "Inject Elite DNA",
    description: "We retrieve structural secrets from the system prompts of Google, OpenAI, and Anthropic, adapting their proven logic to your specific use case.",
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