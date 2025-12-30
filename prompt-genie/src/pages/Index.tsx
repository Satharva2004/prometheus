import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AIModelsMarquee from "@/components/AIModelsMarquee";
import PromptGenerator from "@/components/PromptGenerator";
import HowItWorks from "@/components/HowItWorks";
import ValueProposition from "@/components/ValueProposition";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background bg-grain">
      <div className="relative z-10">
        <Header />
        <main>
          <HeroSection />
          <AIModelsMarquee />
          <PromptGenerator />
          <HowItWorks />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Index;