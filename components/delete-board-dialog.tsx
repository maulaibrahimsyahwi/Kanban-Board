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
import { Board } from "@/contexts/projectContext";
import { toast } from "sonner";

interface DeleteBoardDialogProps {
  board: Board;
  onDelete: (boardId: string) => void;
  trigger?: React.ReactNode;
  disabled?: boolean;
}

export default function DeleteBoardDialog({
  board,
  onDelete,
  trigger,
  disabled = false,
}: DeleteBoardDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      // Simulasi delay untuk UX yang lebih baik
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Panggil function delete dari parent
      onDelete(board.id);

      // Show success toast with Sonner
      toast.success("Board deleted successfully", {
        description: `"${board.name}" board and all its tasks have been removed.`,
        duration: 5000,
      });

      // Tutup dialog
      setIsOpen(false);
    } catch (error) {
      console.error("Error deleting board:", error);

      // Show error toast with Sonner
      toast.error("Failed to delete board", {
        description:
          "An error occurred while deleting the board. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
      case "low":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700";
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            disabled={disabled}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <AlertDialogTitle className="text-left">
                Delete "{board.name}" board?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left">
                This action cannot be undone.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {/* Board Info */}
        <div className="py-4">
          <div className="bg-muted rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-foreground">{board.name}</span>
              <Badge variant="secondary" className="text-xs">
                {board.tasks.length} task{board.tasks.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            {board.tasks.length > 0 && (
              <>
                <Separator className="my-3" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground mb-2">
                    Tasks that will be deleted:
                  </p>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {board.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div
                          className={cn(
                            "px-2 py-1 rounded text-xs font-medium border",
                            getPriorityColor(task.priority)
                          )}
                        >
                          {task.priority}
                        </div>
                        <span className="text-muted-foreground truncate flex-1">
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Warning Message */}
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-red-800 dark:text-red-400">
                  This will permanently delete:
                </p>
                <ul className="mt-1 text-red-700 dark:text-red-300 space-y-1">
                  <li>• The "{board.name}" board</li>
                  <li>• All {board.tasks.length} tasks in this board</li>
                  <li>• All task history and data</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            disabled={isDeleting}
            className="flex items-center gap-2"
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 flex items-center gap-2 min-w-[120px]"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Board
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
