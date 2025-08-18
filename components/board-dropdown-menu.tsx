// components/board-dropdown-menu.tsx
"use client";

import React, { useState } from "react"; // Tambahkan useState di sini
import { FaRegEdit } from "react-icons/fa";
import { MdOutlineDelete, MdOutlineAdd } from "react-icons/md";
import { MoreHorizontal } from "lucide-react";

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
import EditBoardDialog from "@/components/windows-dialogs/board-dialogs/edit-board-dialog"; // Impor komponen baru

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // State untuk dialog edit

  const handleDeleteBoard = (boardId: string) => {
    deleteBoard(boardId);
  };

  const canDelete = totalBoards > 1;

  return (
    <div className="flex items-center gap-2">
      <TaskDialog
        boardId={board.id}
        trigger={
          <Button variant="ghost" size="sm" className="cursor-pointer">
            <MdOutlineAdd className="w-4 h-4" />
          </Button>
        }
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild className="cursor-pointer">
          <Button variant="ghost" size="sm" className="">
            <span className="sr-only">Open board menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="poppins" align="end">
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            <div className="font-medium text-foreground">{board.name}</div>
            <div className="text-xs">
              {board.tasks.length} task{board.tasks.length !== 1 ? "s" : ""} •
              Position {boardIndex + 1}
            </div>
          </div>

          <DropdownMenuSeparator />

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

          <DropdownMenuItem
            className="flex items-center gap-2 p-[10px] cursor-pointer"
            onClick={() => setIsEditDialogOpen(true)} // Panggil dialog edit
          >
            <FaRegEdit className="flex-shrink-0" />
            <span>Edit Board</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

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

      <EditBoardDialog
        board={board}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
      />
    </div>
  );
}
