"use client";

import type { ElementType, ReactNode } from "react";

import {
  DropdownMenuItem,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type CustomCheckboxItemProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: ReactNode;
  className?: string;
};

export function CustomCheckboxItem({
  checked,
  onCheckedChange,
  children,
  className,
}: CustomCheckboxItemProps) {
  return (
    <DropdownMenuItem
      className={cn("cursor-pointer justify-between", className)}
      onSelect={(e) => e.preventDefault()}
      onClick={() => onCheckedChange(!checked)}
    >
      <div className="flex items-center gap-2">{children}</div>
      {checked ? <Check className="w-4 h-4 text-primary" /> : null}
    </DropdownMenuItem>
  );
}

type FilterSubTriggerProps = {
  Icon: ElementType;
  title: string;
  count: number;
  total?: number;
};

export function FilterSubTrigger({
  Icon,
  title,
  count,
  total,
}: FilterSubTriggerProps) {
  return (
    <DropdownMenuSubTrigger className="cursor-pointer h-10">
      <Icon className="w-4 h-4 mr-2" />
      <span>
        {title}
        {total !== undefined && ` (${total})`}
      </span>
      {count > 0 ? (
        <span className="ml-auto mr-1 text-xs bg-muted text-muted-foreground rounded-full px-1.5 py-0.5">
          {count}
        </span>
      ) : null}
    </DropdownMenuSubTrigger>
  );
}

