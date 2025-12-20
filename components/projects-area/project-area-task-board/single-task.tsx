"use client";

/* eslint-disable react-hooks/refs */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  AlignLeft,
  Paperclip,
} from "lucide-react";
import { FaRegCircle } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import { useState, memo } from "react";
import { DraggableProvided, DraggableStateSnapshot } from "@hello-pangea/dnd";
import TasksDropDown from "../../drop-downs/task-drop-down";
import { Task } from "@/types";
import { useProjects } from "@/contexts/projectContext";
import { cn } from "@/lib/utils";
import { useTaskActions } from "@/hooks/use-task-actions";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPriorityConfig, getProgressConfig } from "./single-task-config";
import { TaskDueDateFooter } from "./single-task-due-date";
import { SingleTaskDialogs } from "./single-task-dialogs";

interface SingleTaskProps {
  task: Task;
  boardId: string;
  taskIndex?: number;
  totalTasks?: number;
  provided: DraggableProvided;
  snapshot?: DraggableStateSnapshot;
}

const SingleTask = ({ task, boardId, provided, snapshot }: SingleTaskProps) => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { selectedProject } = useProjects();
  const taskActions = useTaskActions(task.id, boardId);
  const { data: session } = useSession();
  const userDateFormat = session?.user?.dateFormat || "dd/MM/yyyy";
  const priorityConfig = getPriorityConfig(task.priority);
  const PriorityIcon = priorityConfig.icon;
  const progressConfig = getProgressConfig(task.progress);
  const ProgressIcon = progressConfig.icon;
  const checklistItems = task.checklist || [];
  const completedChecklistItems = checklistItems.filter(
    (item) => item.isDone
  ).length;
  const totalChecklistItems = checklistItems.length;

  const handleCardClick = () => {
    if (taskActions.handleEditTask) {
      taskActions.handleEditTask();
    }
  };

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className="relative mb-3"
      style={{
        ...provided.draggableProps.style,
      }}
    >
      <Card
        data-testid="task-card"
        onClick={handleCardClick}
        className={cn(
          "shadow-sm hover:shadow-md transition-all duration-200 bg-card border-border task-card relative py-0 gap-0 cursor-grab active:cursor-grabbing",
          snapshot?.isDragging
            ? "shadow-lg ring-2 ring-primary/20 opacity-90 rotate-2"
            : ""
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

            <div
              onClick={(e) => e.stopPropagation()}
              className="dropdown-trigger-button"
            >
              {taskActions.task && taskActions.currentBoard && (
                <TasksDropDown
                  {...taskActions}
                  task={taskActions.task}
                  currentBoard={taskActions.currentBoard}
                  onOpenDeleteDialog={() => setIsDeleteOpen(true)}
                  onOpenCopyDialog={() => taskActions.setIsCopyDialogOpen(true)}
                />
              )}
            </div>
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
          {(task.assignees?.length > 0 || task.attachments?.length > 0) && (
            <div className="flex items-center gap-3 mt-1">
              {task.assignees?.length > 0 && (
                <div className="flex -space-x-2">
                  {task.assignees.slice(0, 3).map((u, i) => (
                    <Avatar
                      key={u.id || u.email || String(i)}
                      className="w-5 h-5 border border-background"
                    >
                      <AvatarImage src={u.image || ""} />
                      <AvatarFallback className="text-[8px]">
                        {u.name?.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {task.assignees.length > 3 && (
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[8px] border border-background">
                      +{task.assignees.length - 3}
                    </div>
                  )}
                </div>
              )}
              {task.attachments?.length > 0 && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Paperclip className="w-3 h-3 mr-1" />
                  {task.attachments.length}
                </div>
              )}
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
                    title="This task has a description"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </div>
                )}
              {task.cardDisplayPreference !== "checklist" &&
                totalChecklistItems > 0 && (
                  <div
                    className="flex items-center gap-1"
                    title="This task has a checklist"
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
            <TaskDueDateFooter
              dueDate={task.dueDate}
              progress={task.progress}
              dateFormat={userDateFormat}
            />
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

      <SingleTaskDialogs
        task={task}
        boardId={boardId}
        boards={selectedProject?.boards || []}
        taskActions={taskActions}
        isDeleteOpen={isDeleteOpen}
        setIsDeleteOpen={setIsDeleteOpen}
      />
    </div>
  );
};
export default memo(SingleTask);
