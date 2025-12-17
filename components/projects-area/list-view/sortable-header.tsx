import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import type { SortDirection, SortKey } from "./list-view-sorting";

export function SortableHeader({
  label,
  sortKey,
  currentSortKey,
  currentDirection,
  onClick,
}: {
  label: string;
  sortKey: SortKey;
  currentSortKey: SortKey;
  currentDirection: SortDirection;
  onClick: (key: SortKey) => void;
}) {
  const isCurrent = currentSortKey === sortKey;
  const Icon = isCurrent
    ? currentDirection === "asc"
      ? ChevronUp
      : ChevronDown
    : ChevronsUpDown;

  return (
    <div
      className={cn(
        "flex items-center gap-1 cursor-pointer select-none",
        "hover:text-foreground transition-colors",
        isCurrent ? "text-foreground" : "text-muted-foreground/80"
      )}
      onClick={() => onClick(sortKey)}
    >
      <span>{label}</span>
      <Icon className="w-3 h-3 flex-shrink-0" />
    </div>
  );
}

