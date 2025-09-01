// components/drop-downs/task-drop-down.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaRegEdit } from "react-icons/fa";
import { MdOutlineDelete, MdOutlineSwapHoriz } from "react-icons/md";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useProjects } from "@/contexts/projectContext";
import { Task } from "@/contexts/projectContext";
import DeleteTaskDialog from "@/components/windows-dialogs/task-dialog/delete-task-dialog";
import PrioritySelector from "@/components/windows-dialogs/task-dialog/sub-component/priority-selector";
import TaskDescription from "../windows-dialogs/task-dialog/sub-component/task-description";
import TaskName from "../windows-dialogs/task-dialog/sub-component/task-name";
import { toast } from "sonner";

interface TasksDropDownProps {
  taskId: string;
  boardId: string;
  boardIndex?: number;
  totalBoards?: number;
}

export default function TasksDropDown({
  taskId,
  boardId,
  boardIndex = 0,
  totalBoards = 1,
}: TasksDropDownProps) {
  const { selectedProject, deleteTask, moveTask, editTask } = useProjects();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownAlign, setDropdownAlign] = useState<"start" | "end">("end");
  const [isSaving, setIsSaving] = useState(false);
  // Edit form states
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<Task["priority"]>("low");

  const calculateDropdownAlignment = () => {
    if (!triggerRef.current) return "end";

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const dropdownWidth = 280;

    const distanceToRight = viewportWidth - triggerRect.right;

    if (distanceToRight < dropdownWidth + 20) {
      return "start";
    }

    return "end";
  };

  useEffect(() => {
    if (isDropdownOpen) {
      const alignment = calculateDropdownAlignment();
      setDropdownAlign(alignment);
    }
  }, [isDropdownOpen, boardIndex, totalBoards]);

  useEffect(() => {
    const handleResize = () => {
      if (isDropdownOpen) {
        const alignment = calculateDropdownAlignment();
        setDropdownAlign(alignment);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isDropdownOpen]);

  useEffect(() => {
    if (isEditDialogOpen) {
      document.body.classList.add("dialog-open");
    } else {
      document.body.classList.remove("dialog-open");
    }
    return () => {
      document.body.classList.remove("dialog-open");
    };
  }, [isEditDialogOpen]);

  useEffect(() => {
    if (isDropdownOpen) {
      document.body.classList.add("dropdown-open");
    } else {
      document.body.classList.remove("dropdown-open");
    }
    return () => {
      document.body.classList.remove("dropdown-open");
    };
  }, [isDropdownOpen]);

  const handleEditTask = () => {
    if (!selectedProject || !task) return;
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditPriority(task.priority);
    setIsDropdownOpen(false);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || editTitle.length < 3) return;

    setIsSaving(true);

    try {
      // Simulate delay for better UX (optional)
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Call the editTask function
      editTask(taskId, boardId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority,
      });

      // Show success toast with Sonner
      toast.success("Task updated successfully", {
        description: `"${editTitle.trim()}" has been updated in ${
          currentBoard.name
        }.`,
        duration: 5000,
      });

      // Close the dialog
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating task:", error);

      // Show error toast with Sonner
      toast.error("Failed to update task", {
        description:
          "An error occurred while updating the task. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTask = (taskIdToDelete: string) => {
    deleteTask(taskIdToDelete, boardId);
    setIsDropdownOpen(false);
  };

  if (!selectedProject) {
    return null;
  }

  const boards = selectedProject.boards;
  const currentBoardIndex = boards.findIndex((board) => board.id === boardId);

  if (currentBoardIndex === -1) {
    console.error("Current board not found!");
    return null;
  }

  const currentBoard = boards[currentBoardIndex];
  const task = currentBoard.tasks.find((task) => task.id === taskId);

  if (!task) {
    console.error("Task not found in current board");
    return null;
  }

  const previousBoard =
    currentBoardIndex > 0 ? boards[currentBoardIndex - 1] : null;
  const nextBoard =
    currentBoardIndex < boards.length - 1
      ? boards[currentBoardIndex + 1]
      : null;

  const handleMoveToPrevious = () => {
    if (previousBoard) {
      moveTask(taskId, boardId, previousBoard.id);
      setIsDropdownOpen(false);
    }
  };

  const handleMoveToNext = () => {
    if (nextBoard) {
      moveTask(taskId, boardId, nextBoard.id);
      setIsDropdownOpen(false);
    }
  };

  const handleMoveTask = (targetBoardId: string) => {
    if (targetBoardId !== boardId) {
      moveTask(taskId, boardId, targetBoardId);
      setIsDropdownOpen(false);
    }
  };

  const otherBoards = boards.filter((board) => board.id !== boardId);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "low":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  // Helper function to truncate board names
  const truncateBoardName = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength) + "...";
  };

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            ref={triggerRef}
            variant="ghost"
            className="h-8 w-8 p-0 relative z-10"
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="poppins dropdown-content-fixed w-55 sm:w-55" // Responsive width: smaller on mobile
          align={dropdownAlign}
          side="bottom"
          sideOffset={8}
          alignOffset={0}
          avoidCollisions={true}
          collisionPadding={8}
        >
          {/* Task Info */}
          <div className="px-2 py-1.5 text-sm text-muted-foreground border-b">
            <div className="font-medium text-foreground truncate max-w-[200px] sm:max-w-[240px]">
              {task.title}
            </div>
            <div className="text-xs truncate max-w-[200px] sm:max-w-[240px]">
              {truncateBoardName(currentBoard.name, 20)} • {task.priority}{" "}
              priority
            </div>
          </div>

          {/* Edit Task */}
          <DropdownMenuItem
            className="flex items-center gap-2 p-[10px] cursor-pointer"
            onClick={handleEditTask}
          >
            <FaRegEdit className="flex-shrink-0" />
            <span>Edit Task</span>
          </DropdownMenuItem>

          {/* Previous Board Button */}
          {previousBoard && (
            <DropdownMenuItem
              className="flex items-center gap-2 p-[10px] cursor-pointer text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              onClick={handleMoveToPrevious}
            >
              <IoArrowBack className="flex-shrink-0 text-lg" />
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-xs sm:text-sm">Move to</span>
                <span
                  className="font-medium truncate max-w-[140px] sm:max-w-[160px]"
                  title={previousBoard.name}
                >
                  {truncateBoardName(previousBoard.name, 10)}
                </span>
              </div>
            </DropdownMenuItem>
          )}

          {/* Next Board Button */}
          {nextBoard && (
            <DropdownMenuItem
              className="flex items-center gap-2 p-[10px] cursor-pointer text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
              onClick={handleMoveToNext}
            >
              <IoArrowForward className="flex-shrink-0 text-lg" />
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-xs sm:text-sm">Move to</span>
                <span
                  className="font-medium truncate max-w-[140px] sm:max-w-[160px]"
                  title={nextBoard.name}
                >
                  {truncateBoardName(nextBoard.name, 10)}
                </span>
              </div>
            </DropdownMenuItem>
          )}

          {/* Show separator only if we have navigation options */}
          {(previousBoard || nextBoard) && <DropdownMenuSeparator />}

          {/* All Boards Submenu */}
          {otherBoards.length > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center gap-2 p-[10px] cursor-pointer">
                <MdOutlineSwapHoriz className="flex-shrink-0 text-lg" />
                <span>Move to Board</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent
                className="dropdown-subcontent-fixed w-40 sm:w-50" // Smaller width on mobile
                alignOffset={dropdownAlign === "start" ? -10 : 10}
              >
                {otherBoards.map((board) => {
                  const boardIndexInAll = boards.findIndex(
                    (b) => b.id === board.id
                  );
                  const isPrevious = boardIndexInAll === currentBoardIndex - 1;
                  const isNext = boardIndexInAll === currentBoardIndex + 1;

                  return (
                    <DropdownMenuItem
                      key={board.id}
                      className={`cursor-pointer p-2 ${
                        isPrevious
                          ? "text-blue-600 dark:text-blue-400"
                          : isNext
                          ? "text-green-600 dark:text-green-400"
                          : ""
                      }`}
                      onClick={() => handleMoveTask(board.id)}
                    >
                      <div className="flex items-center gap-2 w-full min-w-0">
                        {isPrevious && (
                          <IoArrowBack className="text-sm flex-shrink-0" />
                        )}
                        {isNext && (
                          <IoArrowForward className="text-sm flex-shrink-0" />
                        )}

                        <div className="flex flex-col items-start min-w-0 flex-1">
                          <span
                            className="text-sm font-medium truncate max-w-[160px]"
                            title={board.name}
                          >
                            {truncateBoardName(board.name, 14)}
                          </span>
                          <span className="text-xs opacity-60">
                            {board.tasks.length} task
                            {board.tasks.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}

          <DropdownMenuSeparator />

          {/* Delete Task */}
          <DeleteTaskDialog
            task={task}
            boardName={currentBoard.name}
            onDelete={handleDeleteTask}
            trigger={
              <DropdownMenuItem
                className="flex items-center gap-2 p-[10px] cursor-pointer text-red-600 focus:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                onSelect={(e) => e.preventDefault()}
              >
                <MdOutlineDelete className="flex-shrink-0 text-lg" />
                <span>Delete Task</span>
              </DropdownMenuItem>
            }
          />
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Task Dialog dengan Portal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogPortal>
          <DialogContent className="max-w-md poppins overflow-hidden">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Editing task in &quot;{truncateBoardName(currentBoard.name, 30)}
                &quot; board
              </p>
            </DialogHeader>

            <div className="space-y-4 py-4 overflow-hidden">
              {/* Task Title */}
              <div className="space-y-2">
                <TaskName
                  value={editTitle}
                  onChange={setEditTitle}
                  onEnter={handleSaveEdit}
                />
              </div>

              {/* Task Description */}
              <TaskDescription
                value={editDescription}
                onChange={setEditDescription}
                onEnter={handleSaveEdit}
              />

              {/* Priority */}
              <PrioritySelector
                selectedPriority={editPriority}
                onSelectPriority={setEditPriority}
              />

              {/* Current Priority Preview */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Current:</span>
                <Badge
                  variant="outline"
                  className={`text-xs ${getPriorityColor(editPriority)}`}
                >
                  {editPriority.charAt(0).toUpperCase() + editPriority.slice(1)}
                </Badge>
              </div>

              {/* Keyboard shortcuts hint */}
              <div className="text-xs text-muted-foreground pt-2 border-t">
                <div>
                  Press <span className="font-bold">Enter </span> in title field
                  to save
                </div>
                <div>
                  Press <span className="font-bold">Ctrl + Enter </span> in
                  description to save
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSaving}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={!editTitle.trim() || editTitle.length < 3 || isSaving}
                className="cursor-pointer min-w-[130px]"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
}
