import HeroSection from "@/components/common/home/HeroSection";
import ProductPreview from "@/components/common/home/ProductPreview";
import FeaturesSection from "@/components/common/home/FeaturesSection";
import HowItWorksSection from "@/components/common/home/HowItWorksSection";
import WhyDevFlowSection from "@/components/common/home/WhyDevFlowSection";
import FinalCta from "@/components/common/home/FinalCta";
import HomeFooter from "@/components/common/home/HomeFooter";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        <HeroSection />

        <ProductPreview />

        <FeaturesSection />

        <HowItWorksSection />

        <WhyDevFlowSection />

        <FinalCta />
      </main>

      <HomeFooter />
    </div>
  );
}