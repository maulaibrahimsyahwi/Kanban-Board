"use client";

import * as React from "react";
import { Task } from "@/types";
import { cn } from "@/lib/utils";
import { Check, Circle, Star } from "lucide-react";
import { GoDotFill } from "react-icons/go";
import { DatePicker } from "@/components/ui/date-picker";

export const getPriorityConfig = (priority: Task["priority"]) => {
  switch (priority) {
    case "critical":
      return {
        label: "Mendesak",
        icon: Star,
        colorClass: "text-red-600 dark:text-red-400",
        display: "Mendesak",
        isIconFilled: true,
      };
    case "high":
      return {
        label: "Penting",
        icon: Star,
        colorClass: "text-orange-600 dark:text-orange-400",
        display: "Penting",
        isIconFilled: true,
      };
    case "medium":
      return {
        label: "Sedang",
        icon: GoDotFill,
        colorClass: "text-green-600 dark:text-green-400",
        display: "Sedang",
        isIconFilled: false,
      };
    case "low":
    default:
      return {
        label: "Rendah",
        icon: GoDotFill,
        colorClass: "text-blue-600 dark:text-blue-400",
        display: "Rendah",
        isIconFilled: false,
      };
  }
};

export const getProgressConfig = (progress: Task["progress"]) => {
  switch (progress) {
    case "done":
      return {
        label: "Selesai",
        icon: Check,
        colorClass: "text-green-600 dark:text-green-500",
        display: "Selesai",
      };
    case "in_progress":
      return {
        label: "Dalam proses",
        icon: GoDotFill,
        colorClass: "text-blue-600 dark:text-blue-400",
        display: "Dalam proses",
      };
    case "not_started":
    default:
      return {
        label: "Belum dimulai",
        icon: Circle,
        colorClass: "text-muted-foreground",
        display: "Belum dimulai",
      };
  }
};

export const CompactDatePicker = React.forwardRef<
  HTMLDivElement,
  {
    date: Date | null;
    onDateChange: (date: Date | null) => void;
    placeholder: string;
    isOverdue: boolean;
  }
>(({ date, onDateChange, placeholder, isOverdue }, ref) => {
  const overdueColor = isOverdue
    ? "var(--destructive)"
    : "var(--muted-foreground)";

  return (
    <div
      ref={ref}
      className="relative h-7 w-full min-w-[95px] text-xs compact-date-override"
    >
      <DatePicker
        date={date}
        onDateChange={onDateChange}
        placeholder={placeholder}
      />
      <style jsx global>{`
        .compact-date-override button[data-slot="button"] {
          height: 28px !important;
          padding: 4px 6px !important;
          font-size: 0.75rem !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          width: 100% !important;
          font-weight: 500 !important;
          border-style: dashed !important;
          color: ${isOverdue
            ? "var(--destructive)"
            : "var(--foreground)"} !important;
        }
        .compact-date-override button[data-slot="button"] svg {
          width: 14px !important;
          height: 14px !important;
          margin: 0 !important;
          margin-left: 4px !important;
          color: ${overdueColor} !important;
          flex-shrink: 0 !important;
          display: block !important;
        }
        .compact-date-override button[data-slot="button"] span {
          line-height: 1;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          flex-grow: 1 !important;
          text-align: left !important;
        }
      `}</style>
    </div>
  );
});

CompactDatePicker.displayName = "CompactDatePicker";

export const SimplePriorityDisplay = ({
  priority,
}: {
  priority: Task["priority"];
}) => {
  const config = getPriorityConfig(priority);
  return (
    <div className="flex items-center gap-1">
      {config.display === "Sedang" || config.display === "Rendah" ? (
        <GoDotFill className={cn("w-3 h-3", config.colorClass)} />
      ) : (
        <span
          className={cn(
            "w-2 h-2 rounded-full",
            config.colorClass.replace("text-", "bg-")
          )}
        ></span>
      )}
      <span className="text-muted-foreground text-xs">{config.display}</span>
    </div>
  );
};
