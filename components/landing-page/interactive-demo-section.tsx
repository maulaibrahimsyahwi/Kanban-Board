"use client";

import { DemoFeatureList } from "./interactive-demo/demo-feature-list";
import { DemoBoardPreview } from "./interactive-demo/demo-board-preview";
import { DEMO_FEATURE_ITEMS } from "./landing-content";

export function InteractiveDemoSection() {
  return (
    <section id="demo" className="py-24 overflow-hidden scroll-mt-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              Experience a workflow that{" "}
              <span className="text-primary">adapts to you</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Don&apos;t let rigid tools slow you down. Our board adapts to your
              team&apos;s unique workflow with custom columns, labels, and
              automated actions.
            </p>

            <DemoFeatureList items={[...DEMO_FEATURE_ITEMS]} />
          </div>

          <div className="lg:w-1/2 w-full">
            <DemoBoardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
