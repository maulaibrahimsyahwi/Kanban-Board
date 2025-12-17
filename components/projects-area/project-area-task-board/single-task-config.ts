import { AlertCircle, ArrowDown, BellRing } from "lucide-react";
import { BsCircleHalf } from "react-icons/bs";
import { FaRegCircle } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import { GoDotFill } from "react-icons/go";
import type { Task } from "@/types";

export const getProgressConfig = (progress: Task["progress"]) => {
  switch (progress) {
    case "done":
      return {
        icon: FaCircleCheck,
        label: "Selesai",
        className: "text-green-600 dark:text-green-500",
        bgColor: "bg-green-500/10",
      };
    case "in_progress":
      return {
        icon: BsCircleHalf,
        label: "Dalam proses",
        className: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-500/10",
      };
    case "not_started":
    default:
      return {
        icon: FaRegCircle,
        label: "Belum dimulai",
        className: "text-muted-foreground",
        bgColor: "bg-muted",
      };
  }
};

export const getPriorityConfig = (priority: Task["priority"]) => {
  switch (priority) {
    case "critical":
      return {
        icon: BellRing,
        label: "Mendesak",
        className: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-500/10",
      };
    case "high":
      return {
        icon: AlertCircle,
        label: "Penting",
        className: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-500/10",
      };
    case "medium":
      return {
        icon: GoDotFill,
        label: "Sedang",
        className: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-500/10",
      };
    case "low":
    default:
      return {
        icon: ArrowDown,
        label: "Rendah",
        className: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-500/10",
      };
  }
};
