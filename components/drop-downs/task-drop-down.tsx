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
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useProjects } from "@/contexts/projectContext";
import { Task } from "@/contexts/projectContext";
import DeleteTaskDialog from "@/components/windows-dialogs/task-dialog/delete-task-dialog";
import PrioritySelector from "@/components/windows-dialogs/task-dialog/sub-component/priority-selector";

interface TasksDropDownProps {
  taskId: string;
  boardId: string;
  boardIndex?: number; // 👈 TAMBAH: Index board untuk menentukan posisi
  totalBoards?: number; // 👈 TAMBAH: Total boards untuk mendeteksi board terakhir
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
  const triggerRef = useRef<HTMLButtonElement>(null); // 👈 TAMBAH: Ref untuk trigger
  const [dropdownAlign, setDropdownAlign] = useState<"start" | "end">("end");

  // Edit form states
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<Task["priority"]>("low");

  // 👈 TAMBAH: Function untuk menentukan alignment dropdown berdasarkan posisi
  const calculateDropdownAlignment = () => {
    if (!triggerRef.current) return "end";

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const dropdownWidth = 280; // Estimasi lebar dropdown

    // Jarak dari trigger ke tepi kanan viewport
    const distanceToRight = viewportWidth - triggerRect.right;

    // Jika jarak ke kanan tidak cukup untuk dropdown, align ke kiri (start)
    // Tambahkan buffer 20px untuk memastikan tidak terpotong
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

  const handleSaveEdit = () => {
    if (!editTitle.trim() || editTitle.length < 3) return;
    editTask(taskId, boardId, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      priority: editPriority,
    });
    setIsEditDialogOpen(false);
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
          className="poppins dropdown-content-fixed"
          align={dropdownAlign}
          side="bottom"
          sideOffset={8}
          alignOffset={0}
          avoidCollisions={true}
          collisionPadding={8}
        >
          {/* Task Info */}
          <div className="px-2 py-1.5 text-sm text-muted-foreground border-b">
            <div className="font-medium text-foreground truncate max-w-[200px]">
              {task.title}
            </div>
            <div className="text-xs">
              {currentBoard.name} • {task.priority} priority
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
              <span>Move to &quot;{previousBoard.name}&quot;</span>
            </DropdownMenuItem>
          )}

          {/* Next Board Button */}
          {nextBoard && (
            <DropdownMenuItem
              className="flex items-center gap-2 p-[10px] cursor-pointer text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
              onClick={handleMoveToNext}
            >
              <IoArrowForward className="flex-shrink-0 text-lg" />
              <span>Move to &quot;{nextBoard.name}&quot;</span>
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
                className="dropdown-subcontent-fixed"
                // 👈 TAMBAH: Alignment untuk submenu juga
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
                      className={`cursor-pointer ${
                        isPrevious
                          ? "text-blue-600 dark:text-blue-400"
                          : isNext
                          ? "text-green-600 dark:text-green-400"
                          : ""
                      }`}
                      onClick={() => handleMoveTask(board.id)}
                    >
                      <div className="flex items-center gap-2">
                        {isPrevious && <IoArrowBack className="text-sm" />}
                        {isNext && <IoArrowForward className="text-sm" />}
                        <span>{board.name}</span>
                        <span className="text-xs opacity-60">
                          ({board.tasks.length})
                        </span>
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
          <DialogContent className="max-w-md poppins">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Editing task in &quot;{currentBoard.name}&quot; board
              </p>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Task Title */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Task Title</Label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Enter task title..."
                  className={editTitle.length < 3 ? "border-red-500" : ""}
                />
                {editTitle.length > 0 && editTitle.length < 3 && (
                  <p className="text-red-500 text-xs">
                    Task title must be at least 3 characters
                  </p>
                )}
              </div>

              {/* Task Description */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Task Description</Label>
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Enter task description..."
                  className="resize-none min-h-[100px]"
                />
              </div>

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
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setIsEditDialogOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={!editTitle.trim() || editTitle.length < 3}
                className="cursor-pointer"
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
}
