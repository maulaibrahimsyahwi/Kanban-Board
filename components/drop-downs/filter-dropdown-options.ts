import type { ElementType } from "react";

import {
  AlertCircle,
  ArrowDown,
  BellRing,
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  CalendarRange,
  CalendarX,
  TimerOff,
  TrendingUp,
} from "lucide-react";
import { BsCircleHalf } from "react-icons/bs";
import { FaRegCircle } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import { GoDotFill } from "react-icons/go";

import type { DueDateFilter, PriorityFilter, ProgressFilter } from "@/types";

export type FilterOption<T> = {
  id: T;
  label: string;
  icon: ElementType;
  className?: string;
};

export const DUE_DATE_OPTIONS: FilterOption<DueDateFilter>[] = [
  {
    id: "overdue",
    label: "Overdue",
    icon: TimerOff,
    className: "text-red-600 dark:text-red-400",
  },
  { id: "today", label: "Today", icon: CalendarCheck },
  { id: "tomorrow", label: "Tomorrow", icon: CalendarClock },
  { id: "this-week", label: "This week", icon: CalendarRange },
  { id: "next-week", label: "Next week", icon: CalendarPlus },
  { id: "upcoming", label: "Upcoming", icon: TrendingUp },
  { id: "no-date", label: "No date", icon: CalendarX },
];

export const PRIORITY_OPTIONS: FilterOption<PriorityFilter>[] = [
  {
    id: "critical",
    label: "Critical",
    icon: BellRing,
    className: "text-red-600 dark:text-red-400",
  },
  {
    id: "high",
    label: "High",
    icon: AlertCircle,
    className: "text-orange-600 dark:text-orange-400",
  },
  {
    id: "medium",
    label: "Medium",
    icon: GoDotFill,
    className: "text-green-600 dark:text-green-400",
  },
  {
    id: "low",
    label: "Low",
    icon: ArrowDown,
    className: "text-blue-600 dark:text-blue-400",
  },
];

export const PROGRESS_OPTIONS: FilterOption<ProgressFilter>[] = [
  {
    id: "not_started",
    label: "Not started",
    icon: FaRegCircle,
    className: "text-muted-foreground",
  },
  {
    id: "in_progress",
    label: "In progress",
    icon: BsCircleHalf,
    className: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "done",
    label: "Done",
    icon: FaCircleCheck,
    className: "text-green-600 dark:text-green-500",
  },
];
