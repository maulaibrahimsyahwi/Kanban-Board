// components/drop-downs/task-drop-down.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import { MoreHorizontal } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { FaRegEdit } from "react-icons/fa";
import { MdOutlineDelete, MdOutlineSwapHoriz } from "react-icons/md";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";

import { useTaskActions } from "@/hooks/use-task-actions";
import EditTaskDialog from "@/components/windows-dialogs/task-dialog/edit-task-dialog";
import DeleteTaskDialog from "@/components/windows-dialogs/task-dialog/delete-task-dialog";

interface TasksDropDownProps {
  taskId: string;
  boardId: string;
}

export default function TasksDropDown({ taskId, boardId }: TasksDropDownProps) {
  const {
    // Data
    task,
    currentBoard,
    previousBoard,
    nextBoard,
    otherBoards,
    // State UI
    isEditDialogOpen,
    isDropdownOpen,
    isSaving,
    // State Form
    editTitle,
    editDescription,
    editPriority,
    // Setters
    setIsDropdownOpen,
    setIsEditDialogOpen,
    setEditTitle,
    setEditDescription,
    setEditPriority,
    // Handlers
    handleEditTask,
    handleSaveEdit,
    handleDeleteTask,
    handleMoveToPrevious,
    handleMoveToNext,
    handleMoveTask,
  } = useTaskActions(taskId, boardId);

  // Logika alignment dropdown (TETAP SAMA)
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownAlign, setDropdownAlign] = useState<"start" | "end">("end");

  useEffect(() => {
    if (triggerRef.current && isDropdownOpen) {
      const rect = triggerRef.current.getBoundingClientRect();
      const distanceToRight = window.innerWidth - rect.right;
      if (distanceToRight < 280) {
        // dropdown width
        setDropdownAlign("start");
      } else {
        setDropdownAlign("end");
      }
    }
  }, [isDropdownOpen]);

  if (!task || !currentBoard) {
    return null;
  }

  const truncateBoardName = (name: string, maxLength: number = 20) => {
    return name.length <= maxLength ? name : name.slice(0, maxLength) + "...";
  };

  // STRUKTUR JSX DROPDOWN DI BAWAH INI SAMA PERSIS DENGAN FILE ASLI ANDA
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
          className="poppins dropdown-content-fixed w-55 sm:w-55"
          align={dropdownAlign}
          side="bottom"
          sideOffset={8}
          alignOffset={0}
          avoidCollisions={true}
          collisionPadding={8}
        >
          <div className="px-2 py-1.5 text-sm text-muted-foreground border-b">
            <div className="font-medium text-foreground truncate max-w-[200px] sm:max-w-[240px]">
              {task.title}
            </div>
            <div className="text-xs truncate max-w-[200px] sm:max-w-[240px]">
              {truncateBoardName(currentBoard.name, 20)} • {task.priority}{" "}
              priority
            </div>
          </div>
          <DropdownMenuItem
            className="flex items-center gap-2 p-[10px] cursor-pointer"
            onClick={handleEditTask}
          >
            <FaRegEdit className="flex-shrink-0" />
            <span>Edit Task</span>
          </DropdownMenuItem>
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
          {(previousBoard || nextBoard) && <DropdownMenuSeparator />}
          {otherBoards && otherBoards.length > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center gap-2 p-[10px] cursor-pointer">
                <MdOutlineSwapHoriz className="flex-shrink-0 text-lg" />
                <span>Move to Board</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent
                className="dropdown-subcontent-fixed w-40 sm:w-50"
                alignOffset={dropdownAlign === "start" ? -10 : 10}
              >
                {otherBoards.map((board) => (
                  <DropdownMenuItem
                    key={board.id}
                    className="cursor-pointer p-2"
                    onClick={() => handleMoveTask(board.id)}
                  >
                    {truncateBoardName(board.name, 14)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
          <DropdownMenuSeparator />
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

      <EditTaskDialog
        isOpen={isEditDialogOpen}
        isSaving={isSaving}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveEdit}
        title={editTitle}
        description={editDescription}
        priority={editPriority}
        setTitle={setEditTitle}
        setDescription={setEditDescription}
        setPriority={setEditPriority}
        boardName={currentBoard.name}
      />
    </>
  );
}
