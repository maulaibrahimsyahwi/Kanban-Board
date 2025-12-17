"use client";

import { SectionHeader } from "./section-header";
import { VIEWS } from "./landing-content";
import { MarketingIconCard } from "./marketing-icon-card";

export function ViewsSection() {
  return (
    <section id="views" className="py-24 scroll-mt-24">
      <div className="container mx-auto px-4">
        <SectionHeader
          title={
            <>
              Choose the view that fits your{" "}
              <span className="text-primary">workflow</span>
            </>
          }
          description="Switch between board, list, calendar, and charts without losing context — all backed by the same tasks."
        />

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {VIEWS.map((item, idx) => (
            <MarketingIconCard
              key={item.title}
              item={item}
              index={idx}
              delayStep={0.06}
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
