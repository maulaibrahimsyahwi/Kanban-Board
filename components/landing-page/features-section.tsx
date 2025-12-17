"use client";

import { SectionHeader } from "./section-header";
import { FEATURES } from "./landing-content";
import { MarketingIconCard } from "./marketing-icon-card";

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-muted/30 scroll-mt-24">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="Everything you need to ship"
          description="Features mapped to the real workflow inside FreeKanban - from task planning to team and security settings."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {FEATURES.map((item, idx) => (
            <MarketingIconCard
              key={idx}
              item={item}
              index={idx}
              delayStep={0.1}
              hoverLift
              className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all"
              titleClassName="text-xl"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
