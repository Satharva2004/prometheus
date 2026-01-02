import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const aiModels = [
  { name: "Anthropic", logo: "/anthropic.svg" },
  { name: "ChatGPT", logo: "/chatgpt.svg" },
  { name: "Claude", logo: "/claude.svg" },
  { name: "Cursor", logo: "/cursor.svg" },
  { name: "DeepSeek", logo: "/deepseek.svg" },
  { name: "Devin", logo: "/devin.svg" },
  { name: "Gemini", logo: "/gemini.svg" },
  { name: "GitHub Copilot", logo: "/github-copilot.svg" },
  { name: "Grok", logo: "/grok-(xai).svg" },
  { name: "Jules", logo: "/jules.svg" },
  { name: "LangChain", logo: "/langchain.svg" },
  { name: "Lovable", logo: "/lovable.svg" },
  { name: "Mistral", logo: "/mistral-ai.svg" },
  { name: "Perplexity", logo: "/perplexity.svg" },
  { name: "Replit", logo: "/replit.svg" },
  { name: "Windsurf", logo: "/windsurf.svg" },
];

const AIModelsMarquee = () => {
  return (
    <section id="models" className="py-12 overflow-hidden">
      <div className="container mx-auto px-6 mb-8">
        <p className="text-center font-body text-sm text-muted-foreground/70 tracking-wide">
          Built for every AI you already use
        </p>
      </div>

      <div className="relative">
        {/* Marquee container */}
        <div className="flex animate-marquee hover:[animation-play-state:paused] items-center">
          {/* First set */}
          {aiModels.map((model, index) => (
            <div
              key={`first-${index}`}
              className="flex items-center px-6 md:px-12 shrink-0"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <img
                    src={model.logo}
                    alt={model.name}
                    className="h-10 md:h-14 w-auto object-contain transition-opacity duration-300 cursor-help"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{model.name}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ))}
          {/* Second set */}
          {aiModels.map((model, index) => (
            <div
              key={`second-${index}`}
              className="flex items-center px-6 md:px-12 shrink-0"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <img
                    src={model.logo}
                    alt={model.name}
                    className="h-10 md:h-14 w-auto object-contain transition-opacity duration-300 cursor-help"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{model.name}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ))}
          {/* Third set */}
          {aiModels.map((model, index) => (
            <div
              key={`third-${index}`}
              className="flex items-center px-6 md:px-12 shrink-0"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <img
                    src={model.logo}
                    alt={model.name}
                    className="h-10 md:h-14 w-auto object-contain transition-opacity duration-300 cursor-help"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{model.name}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ))}
          {/* Fourth set */}
          {aiModels.map((model, index) => (
            <div
              key={`fourth-${index}`}
              className="flex items-center px-6 md:px-12 shrink-0"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <img
                    src={model.logo}
                    alt={model.name}
                    className="h-10 md:h-14 w-auto object-contain transition-opacity duration-300 cursor-help"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{model.name}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default AIModelsMarquee;