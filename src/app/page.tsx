import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ConnectCTA } from "@/components/landing/connect-cta";
import { MarketOverview } from "@/components/landing/market-overview";

export default function Home() {
  return (
    <>
      <HeroSection />
      <MarketOverview />
      <FeaturesSection />
      <HowItWorks />
      <ConnectCTA />
    </>
  );
}
