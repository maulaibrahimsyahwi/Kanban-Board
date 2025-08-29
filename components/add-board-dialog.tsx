// components/windows-dialogs/add-board-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Layers } from "lucide-react";
import { useProjects } from "@/contexts/projectContext";
import { toast } from "sonner";
import { MdDashboardCustomize } from "react-icons/md";

const MAX_BOARD_NAME_LENGTH = 30;

interface AddBoardDialogProps {
  trigger?: React.ReactNode;
}

export default function AddBoardDialog({ trigger }: AddBoardDialogProps) {
  const [boardName, setBoardName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { addBoard, selectedProject } = useProjects();

  // Gunakan useEffect untuk mengelola scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("dialog-open");
    } else {
      document.body.classList.remove("dialog-open");
    }
    return () => {
      document.body.classList.remove("dialog-open");
    };
  }, [isOpen]);

  const validateBoardName = (name: string) => {
    if (!name.trim()) {
      setError("Board name is required");
      return false;
    }
    if (name.length < 2) {
      setError("Board name must be at least 2 characters");
      return false;
    }
    if (name.length > MAX_BOARD_NAME_LENGTH) {
      setError(`Board name cannot exceed ${MAX_BOARD_NAME_LENGTH} characters`);
      return false;
    }

    if (
      selectedProject?.boards.some(
        (board) => board.name.toLowerCase() === name.trim().toLowerCase()
      )
    ) {
      setError("A board with this name already exists");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBoardName(boardName)) {
      return;
    }

    setIsCreating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      addBoard(boardName.trim());
      toast.success("Board created successfully", {
        description: `${boardName.trim()} board has been added to your project.`,
        duration: 4000,
      });
      setBoardName("");
      setError("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating board:", error);
      toast.error("Failed to create board", {
        description:
          "An error occurred while creating the board. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setBoardName("");
    setError("");
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Batasi input maksimal 30 karakter
    if (value.length > MAX_BOARD_NAME_LENGTH) {
      return; // Tidak izinkan input lebih dari 30 karakter
    }

    setBoardName(value);
    if (error) {
      validateBoardName(value);
    }
  };

  if (!selectedProject) {
    return null;
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setBoardName("");
          setError("");
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button
            className="flex items-center gap-2 rounded-full h-9 cursor-pointer"
            size="sm"
          >
            <MdDashboardCustomize />
            New Board
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="poppins translate-y-0 fixed sm:max-w-[425px] top-50">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="size-10 bg-muted rounded-full flex justify-center items-center">
                <Layers className="text-xl text-muted-foreground" />
              </div>
              <div>
                <DialogTitle className="text-left">
                  Create New Board
                </DialogTitle>
                <DialogDescription className="text-left">
                  Add a new board to &quot;{selectedProject.name}&quot; project
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-4 py-6">
            <div className="space-y-2">
              <Label htmlFor="boardName">Board Name</Label>
              <Input
                id="boardName"
                value={boardName}
                onChange={handleInputChange}
                className={error ? "border-red-500" : ""}
                placeholder="e.g. Testing, Review, Deployment"
                maxLength={MAX_BOARD_NAME_LENGTH}
                required
                disabled={isCreating}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {boardName.length}/{MAX_BOARD_NAME_LENGTH} characters
                </span>
                <span
                  className={
                    boardName.length >= MAX_BOARD_NAME_LENGTH
                      ? "text-red-500"
                      : ""
                  }
                >
                  {boardName.length >= MAX_BOARD_NAME_LENGTH
                    ? "Maximum reached"
                    : ""}
                </span>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={isCreating}
                className="cursor-pointer"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={
                !boardName.trim() ||
                !!error ||
                isCreating ||
                boardName.length > MAX_BOARD_NAME_LENGTH
              }
              className="min-w-[100px]"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 " />
                  Creating...
                </>
              ) : (
                <div className="flex items-center cursor-pointer">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Board
                </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
