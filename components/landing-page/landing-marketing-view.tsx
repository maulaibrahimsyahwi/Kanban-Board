"use client";

import { Navbar } from "./navbar";
import { HeroSection } from "./hero-section";
import { FeaturesSection } from "./features-section";
import { ViewsSection } from "./views-section";
import { InteractiveDemoSection } from "./interactive-demo-section";
import { SecuritySection } from "./security-section";
import { FAQSection } from "./faq-section";
import { CTASection } from "./cta-section";
import { Footer } from "./footer";

export function LandingMarketingView() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden selection:bg-primary/20">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <HeroSection />
        <FeaturesSection />
        <ViewsSection />
        <InteractiveDemoSection />
        <SecuritySection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

