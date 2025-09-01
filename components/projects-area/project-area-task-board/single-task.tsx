import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MdKeyboardDoubleArrowDown } from "react-icons/md";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { MdOutlineKeyboardDoubleArrowUp } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/types";
import { attachClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import TasksDropDown from "../../drop-downs/task-drop-down";
import { Task } from "@/contexts/projectContext";
import { formatDateSafely } from "@/lib/utils";
import { useProjects } from "@/contexts/projectContext";

interface SingleTaskProps {
  task: Task;
  boardId: string;
  taskIndex?: number;
  totalTasks?: number;
  isDragPreview?: boolean;
}

export default function SingleTask({
  task,
  boardId,
  taskIndex = 0,
  totalTasks = 0,
  isDragPreview = false,
}: SingleTaskProps) {
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
      // Draggable behavior
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
          // Disable smooth scrolling during drag
          const scrollContainer = element.closest(".task-scroll-container");
          if (scrollContainer) {
            scrollContainer.classList.add("disable-scroll-behavior");
          }
        },
        onDrop: () => {
          setIsDragging(false);
          // Re-enable smooth scrolling
          const scrollContainer = element.closest(".task-scroll-container");
          if (scrollContainer) {
            scrollContainer.classList.remove("disable-scroll-behavior");
          }
        },
      }),

      // Drop target for reordering within the same board
      dropTargetForElements({
        element,
        canDrop: ({ source }) => {
          // Only allow drops from tasks in the same board
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

            // Add animation trigger
            setIsAnimating(true);

            // Trigger reorder with animation
            setTimeout(() => {
              const destinationIndex = getReorderDestinationIndex({
                startIndex: sourceIndex,
                indexOfTarget: targetIndex,
                closestEdgeOfTarget: closestEdge,
                axis: "vertical",
              });

              reorderTasksInBoard(boardId, sourceIndex, destinationIndex);

              // Clear animation state after completion
              setTimeout(() => setIsAnimating(false), 300);
            }, 0);
          }
        },
      })
    );
  }, [task, boardId, taskIndex, reorderTasksInBoard]);

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

  // Drop indicator styles
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

  return (
    <div className={`relative ${getDropIndicatorStyle()}`}>
      <Card
        ref={taskRef}
        data-testid="task-card"
        className={`shadow-sm hover:shadow-md transition-all duration-200 bg-card border-border task-card relative ${
          !isDragPreview ? "cursor-grab active:cursor-grabbing" : ""
        } ${
          isDragging
            ? "opacity-50 shadow-lg scale-105 rotate-2 z-50 task-dragging"
            : ""
        } ${isDragPreview ? "transform rotate-6 opacity-90" : ""} ${
          isDraggedOver && !isDragging ? "task-drag-over" : ""
        } ${isAnimating ? "task-animating" : ""}`}
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
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
            <span>Created: {formatDateSafely(task.createdAt)}</span>
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full">
              ID: {task.id.slice(-6)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
