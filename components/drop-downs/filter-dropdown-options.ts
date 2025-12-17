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
    label: "Terlambat",
    icon: TimerOff,
    className: "text-red-600 dark:text-red-400",
  },
  { id: "today", label: "Hari ini", icon: CalendarCheck },
  { id: "tomorrow", label: "Besok", icon: CalendarClock },
  { id: "this-week", label: "Minggu ini", icon: CalendarRange },
  { id: "next-week", label: "Minggu depan", icon: CalendarPlus },
  { id: "upcoming", label: "Mendatang", icon: TrendingUp },
  { id: "no-date", label: "Tidak ada tanggal", icon: CalendarX },
];

export const PRIORITY_OPTIONS: FilterOption<PriorityFilter>[] = [
  {
    id: "critical",
    label: "Mendesak",
    icon: BellRing,
    className: "text-red-600 dark:text-red-400",
  },
  {
    id: "high",
    label: "Penting",
    icon: AlertCircle,
    className: "text-orange-600 dark:text-orange-400",
  },
  {
    id: "medium",
    label: "Sedang",
    icon: GoDotFill,
    className: "text-green-600 dark:text-green-400",
  },
  {
    id: "low",
    label: "Rendah",
    icon: ArrowDown,
    className: "text-blue-600 dark:text-blue-400",
  },
];

export const PROGRESS_OPTIONS: FilterOption<ProgressFilter>[] = [
  {
    id: "not_started",
    label: "Belum dimulai",
    icon: FaRegCircle,
    className: "text-muted-foreground",
  },
  {
    id: "in_progress",
    label: "Dalam proses",
    icon: BsCircleHalf,
    className: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "done",
    label: "Selesai",
    icon: FaCircleCheck,
    className: "text-green-600 dark:text-green-500",
  },
];
