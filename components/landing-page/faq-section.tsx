"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { SectionHeader } from "./section-header";
import { FAQS } from "./landing-content";

export function FAQSection() {
  return (
    <section id="faq" className="py-24 scroll-mt-24">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="FAQ"
          description="Quick answers about how FreeKanban works."
        />

        <div className="mt-12 max-w-3xl mx-auto space-y-3">
          {FAQS.map((item, idx) => (
            <motion.details
              key={item.q}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="group bg-card border border-border rounded-xl p-5"
            >
              <summary className="flex items-center justify-between cursor-pointer list-none font-semibold">
                <span className="pr-4">{item.q}</span>
                <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {item.a}
              </p>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  );
}
