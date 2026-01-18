import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { PricingSection } from "@/components/PricingSection";
import { CompareSection } from "@/components/CompareSection";
import { Footer } from "@/components/Footer";
import TestBanner from "@/components/TestBanner";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <TestBanner />
      <Header />
      <main>
        <HeroSection />
        <PricingSection />
        <CompareSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
