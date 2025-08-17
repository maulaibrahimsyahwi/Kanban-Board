import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MdKeyboardDoubleArrowDown } from "react-icons/md";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { MdOutlineKeyboardDoubleArrowUp } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import TasksDropDown from "../../drop-downs/task-drop-down";
import { Task } from "@/contexts/projectContext";
import { formatDateSafely } from "@/lib/utils";

interface SingleTaskProps {
  task: Task;
  boardId: string;
  isDragPreview?: boolean;
}

export default function SingleTask({
  task,
  boardId,
  isDragPreview = false,
}: SingleTaskProps) {
  const taskRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const element = taskRef.current;
    if (!element || isDragPreview) return;

    return draggable({
      element,
      getInitialData: () => ({
        type: "task",
        task: task,
        taskId: task.id,
        boardId: boardId,
      }),
      onDragStart: () => {
        setIsDragging(true);
      },
      onDrop: () => {
        setIsDragging(false);
      },
    });
  }, [task, boardId, isDragPreview]);

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "high":
        return {
          icon: MdOutlineKeyboardDoubleArrowUp,
          bgColor: "bg-red-500/15",
          textColor: "text-red-900 dark:text-red-400",
          label: "High",
        };
      case "medium":
        return {
          icon: MdKeyboardDoubleArrowRight,
          bgColor: "bg-yellow-500/15",
          textColor: "text-yellow-900 dark:text-yellow-400",
          label: "Medium",
        };
      case "low":
      default:
        return {
          icon: MdKeyboardDoubleArrowDown,
          bgColor: "bg-green-500/15",
          textColor: "text-green-900 dark:text-green-400",
          label: "Low",
        };
    }
  };

  const priorityConfig = getPriorityConfig(task.priority);
  const PriorityIcon = priorityConfig.icon;

  return (
    <Card
      ref={taskRef}
      className={`shadow-sm hover:shadow-md transition-all duration-200 bg-card border-border ${
        !isDragPreview ? "cursor-grab active:cursor-grabbing" : ""
      } ${isDragging ? "opacity-50 shadow-lg scale-105 rotate-2 z-50" : ""} ${
        isDragPreview ? "transform rotate-6 opacity-90" : ""
      }`}
    >
      <CardHeader className="p-4">
        <div className="flex justify-between items-center">
          <div
            className={`p-1 py-[4px] ${priorityConfig.bgColor} rounded-3xl px-3 font-medium ${priorityConfig.textColor} flex items-center gap-1 text-sm`}
          >
            <PriorityIcon className="mb-[2px] text-sm" />
            <span className="text-xs font-semibold">
              {priorityConfig.label}
            </span>
          </div>
          {!isDragPreview && (
            <div onClick={(e) => e.stopPropagation()}>
              <TasksDropDown taskId={task.id} boardId={boardId} />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 pb-4 px-4">
        <h3 className="font-bold text-lg text-foreground line-clamp-2">
          {task.title}
        </h3>
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {task.description}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
          <span>Created: {formatDateSafely(task.createdAt)}</span>
          <span className="bg-primary/10 text-primary px-2 py-1 rounded-full">
            ID: {task.id.slice(-6)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
