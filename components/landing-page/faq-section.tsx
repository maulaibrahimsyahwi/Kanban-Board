"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { SectionHeader } from "./section-header";

const faqs = [
  {
    q: "Can I use this as a personal kanban board?",
    a: "Yes. Create a project, add boards, and manage tasks with priorities, labels, and due dates.",
  },
  {
    q: "Does it support different views?",
    a: "Yes — board, list, calendar, charts, and people view are available to fit different workflows.",
  },
  {
    q: "Is 2FA available?",
    a: "Yes. You can enable two-factor authentication from the security/team settings area.",
  },
  {
    q: "Can I customize project statuses?",
    a: "Yes. Project statuses can be created and edited so your team can use consistent progress labels.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-24 scroll-mt-24">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="FAQ"
          description="Quick answers about how FreeKanban works."
        />

        <div className="mt-12 max-w-3xl mx-auto space-y-3">
          {faqs.map((item, idx) => (
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
