"use client";

import { SectionHeader } from "./section-header";
import { SECURITY_ITEMS } from "./landing-content";
import { MarketingIconCard } from "./marketing-icon-card";

export function SecuritySection() {
  return (
    <section id="security" className="py-24 bg-muted/30 scroll-mt-24">
      <div className="container mx-auto px-4">
        <SectionHeader
          title={
            <>
              Built-in <span className="text-primary">security</span> features
            </>
          }
          description="Stay productive without compromising safety — with 2FA, secure sessions, and team controls."
        />

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {SECURITY_ITEMS.map((item, idx) => (
            <MarketingIconCard
              key={item.title}
              item={item}
              index={idx}
              delayStep={0.06}
              className="bg-card border border-border p-6 rounded-2xl shadow-sm"
              titleClassName="text-lg"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
