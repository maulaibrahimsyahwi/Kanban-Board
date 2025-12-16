"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

type DemoFeatureListProps = {
  items: string[];
};

export function DemoFeatureList({ items }: DemoFeatureListProps) {
  return (
    <ul className="space-y-4">
      {items.map((item, i) => (
        <motion.li
          key={item}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-3"
        >
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="font-medium">{item}</span>
        </motion.li>
      ))}
    </ul>
  );
}

