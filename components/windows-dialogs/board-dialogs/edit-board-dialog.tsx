"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProjects } from "@/contexts/projectContext";
import { Board } from "@/contexts/projectContext";
import { toast } from "sonner";
import { FaRegEdit } from "react-icons/fa";

interface EditBoardDialogProps {
  board: Board;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditBoardDialog({
  board,
  isOpen,
  onClose,
}: EditBoardDialogProps) {
  const [boardName, setBoardName] = useState(board.name);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { editBoard, selectedProject } = useProjects();

  useEffect(() => {
    if (isOpen) {
      setBoardName(board.name);
      setError("");
    }
  }, [isOpen, board.name]);

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
    if (
      selectedProject?.boards.some(
        (b) =>
          b.id !== board.id &&
          b.name.toLowerCase() === name.trim().toLowerCase()
      )
    ) {
      setError("A board with this name already exists");
      return false;
    }
    setError("");
    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBoardName(boardName)) {
      return;
    }

    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      editBoard(board.id, { name: boardName.trim() });
      toast.success("Board updated successfully", {
        description: `Board name has been changed to "${boardName.trim()}".`,
        duration: 4000,
      });
      onClose();
    } catch (error) {
      console.error("Error saving board:", error);
      toast.error("Failed to save board", {
        description: "An error occurred while saving. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBoardName(value);
    if (error) {
      validateBoardName(value);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="poppins sm:max-w-[425px]">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FaRegEdit /> Edit Board
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="boardName">Board Name</Label>
              <Input
                id="boardName"
                value={boardName}
                onChange={handleInputChange}
                className={error ? "border-red-500" : ""}
                placeholder="e.g. In Progress, Done"
                required
                disabled={isSaving}
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!boardName.trim() || !!error || isSaving}
              className="min-w-[100px]"
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
