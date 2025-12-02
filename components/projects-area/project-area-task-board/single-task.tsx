"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  BellRing,
  AlertCircle,
  ArrowDown,
  CalendarDays,
  AlignLeft,
} from "lucide-react";
import { FaRegCircle } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import { BsCircleHalf } from "react-icons/bs";
import { GoDotFill } from "react-icons/go";
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
import { useProjects } from "@/contexts/projectContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id as indonesianLocale } from "date-fns/locale";
import { useTaskActions } from "@/hooks/use-task-actions";
import EditTaskDialog from "@/components/windows-dialogs/task-dialog/edit-task-dialog";
import DeleteTaskDialog from "@/components/windows-dialogs/task-dialog/delete-task-dialog";
import CopyTaskDialog from "@/components/windows-dialogs/task-dialog/copy-task-dialog";
import { useSession } from "next-auth/react";

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
        icon: FaCircleCheck,
        label: "Selesai",
        className: "text-green-600 dark:text-green-500",
        bgColor: "bg-green-500/10",
      };
    case "in-progress":
      return {
        icon: BsCircleHalf,
        label: "Dalam proses",
        className: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-500/10",
      };
    case "not-started":
    default:
      return {
        icon: FaRegCircle,
        label: "Belum dimulai",
        className: "text-muted-foreground",
        bgColor: "bg-muted",
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
  const [wasDragged, setWasDragged] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { reorderTasksInBoard, selectedProject } = useProjects();
  const taskActions = useTaskActions(task.id, boardId);
  const { data: session } = useSession();
  const userDateFormat = session?.user?.dateFormat || "dd/MM/yyyy";

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
          setWasDragged(true);
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

  const checklistItems = task.checklist || [];
  const completedChecklistItems = checklistItems.filter(
    (item) => item.isDone
  ).length;
  const totalChecklistItems = checklistItems.length;

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

  const renderDueDateFooter = (
    dueDate: Date | null,
    progress: Task["progress"]
  ) => {
    if (!dueDate) {
      return <span></span>;
    }

    const taskDueDate = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDateOnly = new Date(taskDueDate.getTime());
    dueDateOnly.setHours(0, 0, 0, 0);

    const isOverdue = dueDateOnly < today && progress !== "completed";

    const formattedDate = format(taskDueDate, userDateFormat, {
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
  };

  const handleCardClick = () => {
    if (wasDragged) {
      setWasDragged(false);
      return;
    }
    taskActions.handleEditTask();
  };

  if (!taskActions.task || !taskActions.currentBoard || !selectedProject) {
    return null;
  }

  return (
    <div className={`relative ${getDropIndicatorStyle()}`}>
      <Card
        ref={taskRef}
        data-testid="task-card"
        onClick={handleCardClick}
        className={cn(
          "shadow-sm hover:shadow-md transition-all duration-200 bg-card border-border task-card relative py-0 gap-0",
          !isDragPreview ? "cursor-grab active:cursor-grabbing" : "",
          isDragging
            ? "opacity-50 shadow-lg scale-105 rotate-2 z-50 task-dragging"
            : "",
          isDragPreview ? "transform rotate-6 opacity-90" : "",
          isDraggedOver && !isDragging ? "task-drag-over" : "",
          isAnimating ? "task-animating" : ""
        )}
      >
        <CardHeader className="pt-3 px-4 pb-2">
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
                <TasksDropDown
                  {...taskActions}
                  task={taskActions.task}
                  currentBoard={taskActions.currentBoard}
                  onOpenDeleteDialog={() => setIsDeleteOpen(true)}
                  onOpenCopyDialog={() => taskActions.setIsCopyDialogOpen(true)}
                />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-2 pb-3 px-4">
          <h3 className="font-bold text-lg text-foreground line-clamp-2">
            {task.title}
          </h3>

          {task.cardDisplayPreference === "description" && task.description && (
            <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-line">
              {task.description}
            </p>
          )}

          {task.cardDisplayPreference === "checklist" &&
            totalChecklistItems > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  {completedChecklistItems === totalChecklistItems ? (
                    <FaCircleCheck className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <FaRegCircle className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {completedChecklistItems} / {totalChecklistItems} item
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 pl-5">
                  {checklistItems.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "text-xs text-muted-foreground flex items-center gap-1.5",
                        item.isDone && "line-through opacity-70"
                      )}
                    >
                      {item.isDone ? (
                        <FaCircleCheck className="w-3 h-3" />
                      ) : (
                        <FaRegCircle className="w-3 h-3" />
                      )}
                      <span className="truncate">{item.text}</span>
                    </div>
                  ))}
                  {totalChecklistItems > 5 && (
                    <span className="text-xs text-muted-foreground">
                      + {totalChecklistItems - 5} lainnya...
                    </span>
                  )}
                </div>
              </div>
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

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {task.cardDisplayPreference !== "description" &&
                task.description && (
                  <div
                    className="flex items-center gap-1"
                    title="Tugas ini memiliki deskripsi"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </div>
                )}
              {task.cardDisplayPreference !== "checklist" &&
                totalChecklistItems > 0 && (
                  <div
                    className="flex items-center gap-1"
                    title="Tugas ini memiliki daftar periksa"
                  >
                    <FaCircleCheck className="w-3.5 h-3.5" />
                    <span>
                      {completedChecklistItems}/{totalChecklistItems}
                    </span>
                  </div>
                )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
            {renderDueDateFooter(task.dueDate, task.progress)}
            <div
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
                progressConfig.bgColor,
                progressConfig.className
              )}
            >
              <ProgressIcon className="w-3.5 h-3.5" />
              <span>{progressConfig.label}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditTaskDialog
        isOpen={taskActions.isEditDialogOpen}
        isSaving={taskActions.isSaving}
        onClose={() => taskActions.setIsEditDialogOpen(false)}
        onSave={taskActions.handleSaveEdit}
        title={taskActions.editTitle}
        description={taskActions.editDescription}
        priority={taskActions.editPriority}
        progress={taskActions.editProgress}
        startDate={taskActions.editStartDate}
        dueDate={taskActions.editDueDate}
        editLabels={taskActions.editLabels}
        editBoardId={taskActions.editBoardId}
        boards={selectedProject.boards}
        setTitle={taskActions.setEditTitle}
        setDescription={taskActions.setEditDescription}
        setPriority={taskActions.setEditPriority}
        setProgress={taskActions.setEditProgress}
        setStartDate={taskActions.setEditStartDate}
        setDueDate={taskActions.setEditDueDate}
        setEditLabels={taskActions.setEditLabels}
        setEditBoardId={taskActions.setEditBoardId}
        boardName={taskActions.currentBoard.name}
        editChecklist={taskActions.editChecklist}
        editCardDisplayPreference={taskActions.editCardDisplayPreference}
        setEditChecklist={taskActions.setEditChecklist}
        setEditCardDisplayPreference={taskActions.setEditCardDisplayPreference}
      />

      <DeleteTaskDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        task={task}
        boardName={taskActions.currentBoard.name}
        onDelete={taskActions.handleDeleteTask}
      />

      <CopyTaskDialog
        isOpen={taskActions.isCopyDialogOpen}
        onOpenChange={taskActions.setIsCopyDialogOpen}
        task={task}
        currentBoardId={boardId}
      />
    </div>
  );
};

export default memo(SingleTask);
