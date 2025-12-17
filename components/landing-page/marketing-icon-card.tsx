"use client";

import type { ReactNode } from "react";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import type { MarketingIconCardItem } from "./landing-content";

type MarketingIconCardProps = {
  item: MarketingIconCardItem;
  index: number;
  delayStep: number;
  className: string;
  titleClassName?: string;
  hoverLift?: boolean;
  descriptionClassName?: string;
  iconClassName?: string;
  extraContent?: ReactNode;
};

export function MarketingIconCard({
  item,
  index,
  delayStep,
  className,
  titleClassName,
  hoverLift,
  descriptionClassName,
  iconClassName,
  extraContent,
}: MarketingIconCardProps) {
  const Icon = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * delayStep }}
      whileHover={hoverLift ? { y: -5 } : undefined}
      className={className}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
          item.color
        )}
      >
        <Icon className={cn("w-6 h-6", iconClassName)} />
      </div>
      <h3 className={cn("font-semibold mb-2", titleClassName)}>{item.title}</h3>
      <p className={cn("text-muted-foreground text-sm leading-relaxed", descriptionClassName)}>
        {item.description}
      </p>
      {extraContent}
    </motion.div>
  );
}

