"use client";

import React from "react";
import { MoreHorizontal, Tag, Copy } from "lucide-react";
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
import { MdOutlineDelete, MdOutlineSwapHoriz } from "react-icons/md";
import { cn } from "@/lib/utils";
import { DEFAULT_LABELS, TaskLabel } from "@/constants";
import { Task, Board } from "@/types";

interface TasksDropDownProps {
  task: Task;
  currentBoard: Board;
  otherBoards: Board[];
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
  editLabels: Task["labels"];
  handleMoveTask: (boardId: string) => void;
  handleToggleLabel: (label: TaskLabel) => void;
  onOpenDeleteDialog: () => void;
  onOpenCopyDialog: () => void;
}

export default function TasksDropDown({
  task,
  currentBoard,
  otherBoards,
  isDropdownOpen,
  setIsDropdownOpen,
  editLabels,
  handleMoveTask,
  handleToggleLabel,
  onOpenDeleteDialog,
  onOpenCopyDialog,
}: TasksDropDownProps) {
  if (!task || !currentBoard) {
    return null;
  }

  const truncateBoardName = (name: string, maxLength: number = 20) => {
    return name.length <= maxLength ? name : name.slice(0, maxLength) + "...";
  };

  const availableLabels = DEFAULT_LABELS.filter(
    (defaultLabel) =>
      !editLabels.some(
        (selectedLabel) => selectedLabel.name === defaultLabel.name
      )
  );

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <button className="h-8 w-8 p-0 relative z-10 flex items-center justify-center">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="poppins dropdown-content-fixed w-55 sm:w-55"
        align="end"
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
          onClick={onOpenCopyDialog}
        >
          <Copy className="flex-shrink-0 w-4 h-4" />
          <span>Salin Tugas</span>
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2 p-[10px] cursor-pointer">
            <Tag className="flex-shrink-0 w-4 h-4" />
            <span>Labels</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent
            className="dropdown-subcontent-fixed w-40 sm:w-50 flex flex-col gap-1"
            alignOffset={-10}
          >
            {availableLabels.length === 0 && (
              <DropdownMenuItem
                disabled
                className="cursor-default p-2 text-muted-foreground"
              >
                Semua label telah dipilih
              </DropdownMenuItem>
            )}
            {availableLabels.map((label) => {
              return (
                <DropdownMenuItem
                  key={label.id}
                  className="cursor-pointer p-1"
                  onSelect={(e) => e.preventDefault()}
                  onClick={() => handleToggleLabel(label)}
                >
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-xs font-medium w-full",
                      label.color
                    )}
                  >
                    {label.name}
                  </span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {otherBoards && otherBoards.length > 0 && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 p-[10px] cursor-pointer">
              <MdOutlineSwapHoriz className="flex-shrink-0 w-4 h-4" />
              <span>Move to Board</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent
              className="dropdown-subcontent-fixed w-40 sm:w-50"
              alignOffset={-10}
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
        <DropdownMenuItem
          className="flex items-center gap-2 p-[10px] cursor-pointer text-red-600 focus:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          onSelect={(e) => e.preventDefault()}
          onClick={onOpenDeleteDialog}
        >
          <MdOutlineDelete className="flex-shrink-0 w-4 h-4" />
          <span>Delete Task</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
