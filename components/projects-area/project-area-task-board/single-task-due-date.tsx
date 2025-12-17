import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { id as indonesianLocale } from "date-fns/locale";
import type { Task } from "@/types";
import { cn } from "@/lib/utils";

export function TaskDueDateFooter({
  dueDate,
  progress,
  dateFormat,
}: {
  dueDate: Date | null;
  progress: Task["progress"];
  dateFormat: string;
}) {
  if (!dueDate) {
    return <span />;
  }

  const taskDueDate = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDateOnly = new Date(taskDueDate.getTime());
  dueDateOnly.setHours(0, 0, 0, 0);

  const isOverdue = dueDateOnly < today && progress !== "done";
  const formattedDate = format(taskDueDate, dateFormat, {
    locale: indonesianLocale,
  });

  const boxColorClasses = isOverdue
    ? "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
    : "bg-muted text-muted-foreground";

  const iconColorClasses = isOverdue
    ? "text-red-600 dark:text-red-400"
    : "text-muted-foreground";

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-md",
        boxColorClasses
      )}
    >
      <CalendarDays className={cn("w-3.5 h-3.5", iconColorClasses)} />
      <span className="text-xs font-medium">{formattedDate}</span>
    </div>
  );
}
