"use client";

import { useState } from "react";
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

interface AddBoardDialogProps {
  trigger?: React.ReactNode;
}

export default function AddBoardDialog({ trigger }: AddBoardDialogProps) {
  const [boardName, setBoardName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { addBoard, selectedProject } = useProjects();

  const validateBoardName = (name: string) => {
    if (!name.trim()) {
      setError("Board name is required");
      return false;
    }
    if (name.length < 2) {
      setError("Board name must be at least 2 characters");
      return false;
    }
    if (name.length > 25) {
      setError("Board name must be less than 25 characters");
      return false;
    }

    // Check if board name already exists
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
      // Simulasi delay untuk UX yang lebih baik
      await new Promise((resolve) => setTimeout(resolve, 500));

      addBoard(boardName.trim());

      // Show success toast with Sonner
      toast.success("Board created successfully", {
        description: `&quot;${boardName.trim()}&quot; board has been added to your project.`,
        duration: 4000,
      });

      // Reset form dan tutup dialog
      setBoardName("");
      setError("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating board:", error);

      // Show error toast with Sonner
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
            Add Board
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="poppins sm:max-w-[425px]">
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
                required
                disabled={isCreating}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            {/* Board Preview */}
            {boardName.trim() && !error && (
              <div className="bg-muted p-3 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                <div className="bg-card border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      {boardName.trim()}
                    </span>
                    <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      0
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={isCreating}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={!boardName.trim() || !!error || isCreating}
              className="min-w-[100px]"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Board
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
