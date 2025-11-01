import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  BellRing,
  AlertCircle,
  Circle,
  ArrowDown,
  CheckCircle2,
  Loader2,
  CircleDot,
  CalendarDays,
} from "lucide-react";
import { useEffect, useRef, useState, memo } from "react";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/types";
import { attachClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import TasksDropDown from "../../drop-downs/task-drop-down";
import { Task } from "@/types";
import { formatDateSafely } from "@/lib/utils";
import { useProjects } from "@/contexts/projectContext";
import { cn } from "@/lib/utils";

interface SingleTaskProps {
  task: Task;
  boardId: string;
  taskIndex?: number;
  totalTasks?: number;
  isDragPreview?: boolean;
}

const getProgressConfig = (progress: Task["progress"]) => {
  switch (progress) {
    case "completed":
      return {
        icon: CheckCircle2,
        label: "Selesai",
        className: "text-green-600 dark:text-green-500",
      };
    case "in-progress":
      return {
        icon: Loader2,
        label: "Dalam proses",
        className: "text-blue-600 dark:text-blue-400",
      };
    case "not-started":
    default:
      return {
        icon: CircleDot,
        label: "Belum dimulai",
        className: "text-muted-foreground",
      };
  }
};

const getPriorityConfig = (priority: Task["priority"]) => {
  switch (priority) {
    case "urgent":
      return {
        icon: BellRing,
        label: "Mendesak",
        className: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-500/10",
      };
    case "important":
      return {
        icon: AlertCircle,
        label: "Penting",
        className: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-500/10",
      };
    case "medium":
      return {
        icon: Circle,
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

const SingleTask = ({
  task,
  boardId,
  taskIndex = 0,
  isDragPreview = false,
}: SingleTaskProps) => {
  const taskRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const { reorderTasksInBoard } = useProjects();
  useEffect(() => {
    const element = taskRef.current;
    if (!element || isDragPreview) return;

    return combine(
      draggable({
        element,
        getInitialData: () => ({
          type: "task",
          task: task,
          taskId: task.id,
          boardId: boardId,
          taskIndex: taskIndex,
        }),
        onDragStart: () => {
          setIsDragging(true);
          const scrollContainer = element.closest(".task-scroll-container");
          if (scrollContainer) {
            scrollContainer.classList.add("disable-scroll-behavior");
          }
        },
        onDrop: () => {
          setIsDragging(false);
          const scrollContainer = element.closest(".task-scroll-container");
          if (scrollContainer) {
            scrollContainer.classList.remove("disable-scroll-behavior");
          }
        },
      }),

      dropTargetForElements({
        element,
        canDrop: ({ source }) => {
          return (
            source.data.type === "task" &&
            source.data.boardId === boardId &&
            source.data.taskId !== task.id
          );
        },
        getData: ({ input, element }) => {
          const data = {
            type: "task-reorder",
            taskId: task.id,
            boardId: boardId,
            taskIndex: taskIndex,
          };
          return attachClosestEdge(data, {
            input,
            element,
            allowedEdges: ["top", "bottom"],
          });
        },
        getIsSticky: () => true,
        onDragEnter: ({ source }) => {
          if (source.data.type === "task" && source.data.boardId === boardId) {
            setIsDraggedOver(true);
          }
        },
        onDragLeave: ({ source }) => {
          if (source.data.type === "task" && source.data.boardId === boardId) {
            setIsDraggedOver(false);
            setClosestEdge(null);
          }
        },
        onDrag: ({ self, source }) => {
          if (source.data.type === "task" && source.data.boardId === boardId) {
            const closestEdge = self.data.closestEdge as Edge;
            setClosestEdge(closestEdge);
          }
        },
        onDrop: ({ source, self }) => {
          setIsDraggedOver(false);
          setClosestEdge(null);

          if (source.data.type === "task" && source.data.boardId === boardId) {
            const sourceIndex = source.data.taskIndex as number;
            const targetIndex = taskIndex;
            const closestEdge = self.data.closestEdge as Edge;

            if (sourceIndex === targetIndex) return;
            setIsAnimating(true);
            setTimeout(() => {
              const destinationIndex = getReorderDestinationIndex({
                startIndex: sourceIndex,
                indexOfTarget: targetIndex,
                closestEdgeOfTarget: closestEdge,
                axis: "vertical",
              });

              reorderTasksInBoard(boardId, sourceIndex, destinationIndex);

              setTimeout(() => setIsAnimating(false), 300);
            }, 0);
          }
        },
      })
    );
  }, [task, boardId, taskIndex, reorderTasksInBoard, isDragPreview]);

  const priorityConfig = getPriorityConfig(task.priority);
  const PriorityIcon = priorityConfig.icon;

  const progressConfig = getProgressConfig(task.progress);
  const ProgressIcon = progressConfig.icon;

  const getDropIndicatorStyle = () => {
    if (!isDraggedOver || !closestEdge) return "";
    const baseStyle =
      "after:content-[''] after:absolute after:left-0 after:right-0 after:h-0.5 after:bg-primary after:z-10";
    if (closestEdge === "top") {
      return `${baseStyle} after:-top-1`;
    } else if (closestEdge === "bottom") {
      return `${baseStyle} after:-bottom-1`;
    }

    return "";
  };

  const isOverdue =
    task.dueDate &&
    task.progress !== "completed" &&
    new Date(task.dueDate) < new Date();

  return (
    <div className={`relative ${getDropIndicatorStyle()}`}>
      <Card
        ref={taskRef}
        data-testid="task-card"
        className={cn(
          "shadow-sm hover:shadow-md transition-all duration-200 bg-card border-border task-card relative",
          !isDragPreview ? "cursor-grab active:cursor-grabbing" : "",
          isDragging
            ? "opacity-50 shadow-lg scale-105 rotate-2 z-50 task-dragging"
            : "",
          isDragPreview ? "transform rotate-6 opacity-90" : "",
          isDraggedOver && !isDragging ? "task-drag-over" : "",
          isAnimating ? "task-animating" : ""
        )}
      >
        <CardHeader className="p-4">
          <div className="flex justify-between items-center">
            <div
              className={cn(
                "p-1 py-[4px] rounded-3xl px-3 font-medium flex items-center gap-1 text-sm",
                priorityConfig.bgColor,
                priorityConfig.className
              )}
            >
              <PriorityIcon className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">
                {priorityConfig.label}
              </span>
            </div>
            {!isDragPreview && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="dropdown-trigger-button"
              >
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

          <div className="flex flex-col gap-2 pt-2 mt-2 border-t border-border/50">
            {task.labels && task.labels.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {task.labels.map((label) => (
                  <div
                    key={label.name}
                    className={cn(
                      "px-2 py-0.5 rounded text-xs font-medium w-fit",
                      label.color
                    )}
                  >
                    {label.name}
                  </div>
                ))}
              </div>
            )}

            <div
              className={cn(
                "flex items-center gap-2 text-sm",
                progressConfig.className
              )}
            >
              <ProgressIcon
                className={cn(
                  "w-4 h-4",
                  task.progress === "in-progress" && "animate-spin"
                )}
              />
              <span className="text-xs font-medium">
                {progressConfig.label}
              </span>
            </div>

            {task.dueDate && (
              <div
                className={cn(
                  "flex items-center gap-2 text-sm",
                  isOverdue ? "text-red-600" : "text-muted-foreground"
                )}
              >
                <CalendarDays className="w-4 h-4" />
                <span className="text-xs font-medium">
                  {isOverdue ? "Terlewat: " : "Tenggat: "}
                  {formatDateSafely(task.dueDate)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
            <span>{formatDateSafely(task.createdAt)}</span>
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full">
              ID: {task.id.slice(-6)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default memo(SingleTask);
