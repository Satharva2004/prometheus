const values = [
  "Context-aware system prompts",
  "Optimized per AI model",
  "Built for agents, workflows, tools",
  "Designed for builders, not hype",
];

const ValueProposition = () => {
  return (
    <section className="py-24 border-t border-border/30">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-12">
            What makes this different
          </h2>

          <ul className="space-y-4">
            {values.map((value, index) => (
              <li 
                key={index}
                className="font-body text-lg text-muted-foreground animate-fade-in-up"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                {value}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;