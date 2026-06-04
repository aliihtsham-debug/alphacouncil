import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ConnectCTA } from "@/components/landing/connect-cta";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <ConnectCTA />
    </>
  );
}
