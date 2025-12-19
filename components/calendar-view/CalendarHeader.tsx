"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

interface CalendarHeaderProps {
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
}

export default function CalendarHeader({
  currentMonth,
  onMonthChange,
}: CalendarHeaderProps) {
  const prevMonth = new Date(currentMonth);
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  const nextMonth = new Date(currentMonth);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  return (
    <div className="flex items-center justify-between p-2">
      {/* Navigasi Bulan */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMonthChange(prevMonth)}
          className="hover:bg-transparent text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMonthChange(new Date())}
          className="font-semibold text-sm hover:bg-transparent text-foreground"
        >
          {format(currentMonth, "MMMM yyyy", { locale: enUS })}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMonthChange(nextMonth)}
          className="hover:bg-transparent text-foreground"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Tombol Filter */}
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 text-foreground"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 3.99998H14M4 7.99998H12M7.33333 12H8.66667"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Filter
      </Button>
    </div>
  );
}
