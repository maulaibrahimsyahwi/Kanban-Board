// components/board-dropdown-menu.tsx
"use client";

import React from "react";
import { FaRegEdit } from "react-icons/fa";
import { MdOutlineDelete, MdOutlineAdd } from "react-icons/md";
import { MoreHorizontal, Settings } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Board } from "@/contexts/projectContext";
import { useProjects } from "@/contexts/projectContext";
import DeleteBoardDialog from "./delete-board-dialog";
import TaskDialog from "@/components/windows-dialogs/task-dialog/taskdialog";

interface BoardDropDownProps {
  board: Board;
  boardIndex: number;
  totalBoards: number;
}

export default function BoardDropDown({
  board,
  boardIndex,
  totalBoards,
}: BoardDropDownProps) {
  const { deleteBoard } = useProjects();
  // Note: editBoard removed as it's not currently used - will be implemented when edit functionality is added

  const handleEditBoard = () => {
    console.log("Edit board clicked", board.id);
    // TODO: Implementasi edit board
    // Anda bisa buat EditBoardDialog serupa dengan TaskDialog
  };

  const handleDeleteBoard = (boardId: string) => {
    console.log("Deleting board:", boardId);
    deleteBoard(boardId);
  };

  // Note: handleAddTask removed as TaskDialog component handles this directly

  // Prevent deleting if it's the last board
  const canDelete = totalBoards > 1;

  return (
    <div className="flex items-center gap-2">
      {/* Add Task Button */}
      <TaskDialog
        boardId={board.id}
        trigger={
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary cursor-pointer"
          >
            <MdOutlineAdd className="w-4 h-4" />
          </Button>
        }
      />

      {/* Board Menu Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="cursor-pointer">
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <span className="sr-only">Open board menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="poppins" align="end">
          {/* Board Info */}
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            <div className="font-medium text-foreground">{board.name}</div>
            <div className="text-xs">
              {board.tasks.length} task{board.tasks.length !== 1 ? "s" : ""} •
              Position {boardIndex + 1}
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Add Task */}
          <TaskDialog
            boardId={board.id}
            trigger={
              <DropdownMenuItem
                className="flex items-center gap-2 p-[10px] cursor-pointer"
                onSelect={(e) => e.preventDefault()}
              >
                <MdOutlineAdd className="flex-shrink-0 text-lg" />
                <span>Add Task</span>
              </DropdownMenuItem>
            }
          />

          {/* Edit Board */}
          <DropdownMenuItem
            className="flex items-center gap-2 p-[10px] cursor-pointer"
            onClick={handleEditBoard}
          >
            <FaRegEdit className="flex-shrink-0" />
            <span>Edit Board</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Delete Board */}
          <DeleteBoardDialog
            board={board}
            onDelete={handleDeleteBoard}
            disabled={!canDelete}
            trigger={
              <DropdownMenuItem
                className={`flex items-center gap-2 p-[10px] cursor-pointer ${
                  canDelete
                    ? "text-red-600 focus:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    : "text-muted-foreground opacity-50 cursor-not-allowed"
                }`}
                onSelect={(e) => e.preventDefault()}
                disabled={!canDelete}
              >
                <MdOutlineDelete className="flex-shrink-0 text-lg" />
                <span>Delete Board</span>
                {!canDelete && (
                  <span className="ml-auto text-xs">(Last board)</span>
                )}
              </DropdownMenuItem>
            }
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
