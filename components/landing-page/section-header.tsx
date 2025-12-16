import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeader({
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "space-y-4",
        align === "center" ? "text-center" : "text-left",
        className
      )}
    >
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      {description ? (
        <p
          className={cn(
            "text-muted-foreground",
            align === "center" ? "max-w-2xl mx-auto" : "max-w-3xl"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

