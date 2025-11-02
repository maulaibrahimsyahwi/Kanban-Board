"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "@/types";
import { toast } from "sonner";
import { formatDateSafely } from "@/lib/utils";

interface DeleteTaskDialogProps {
  task: Task;
  boardName: string;
  onDelete: (taskId: string) => void;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function DeleteTaskDialog({
  task,
  boardName,
  onDelete,
  trigger,
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
}: DeleteTaskDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOpen = controlledIsOpen ?? internalIsOpen;
  const setIsOpen = controlledOnOpenChange ?? setInternalIsOpen;

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      onDelete(task.id);
      toast.success("Task deleted successfully", {
        description: `${task.title} has been removed from ${boardName}.`,
        duration: 5000,
      });
      setIsOpen(false);
    } catch {
      console.error("Error deleting task");
      toast.error("Failed to delete task", {
        description:
          "An error occurred while deleting the task. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "high":
        return {
          color:
            "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
          label: "High Priority",
        };
      case "medium":
        return {
          color:
            "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
          label: "Medium Priority",
        };
      case "low":
        return {
          color:
            "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
          label: "Low Priority",
        };
      default:
        return {
          color:
            "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700",
          label: "Normal Priority",
        };
    }
  };

  const priorityConfig = getPriorityConfig(task.priority);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}

      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <AlertDialogTitle className="text-left">
                Delete this task?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left">
                This action cannot be undone.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="py-4">
          <div className="bg-muted rounded-lg p-4 border">
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-foreground text-lg leading-tight pr-2">
                {task.title}
              </h4>
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs font-medium border",
                  priorityConfig.color
                )}
              >
                {task.priority}
              </Badge>
            </div>

            {task.description && (
              <>
                <Separator className="my-3" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">
                    Description:
                  </p>
                  <p className="text-sm text-muted-foreground bg-background p-3 rounded border">
                    {task.description}
                  </p>
                </div>
              </>
            )}

            <Separator className="my-3" />
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between items-center">
                <span>Board:</span>
                <span className="font-medium text-foreground">{boardName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Created:</span>
                <span className="font-medium text-foreground">
                  {formatDateSafely(task.createdAt)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Task ID:</span>
                <span className="font-mono text-primary">
                  {task.id.slice(-8)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-red-800 dark:text-red-400">
                  This will permanently delete:
                </p>
                <ul className="mt-1 text-red-700 dark:text-red-300 space-y-1">
                  <li>• The task &quot;{task.title}&quot;</li>
                  <li>• All task content and description</li>
                  <li>• Task history and metadata</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            disabled={isDeleting}
            className="flex items-center gap-2 cursor-pointer"
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 flex items-center gap-2 min-w-[120px] cursor-pointer"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Task
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
