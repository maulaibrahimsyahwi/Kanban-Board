// components/windows-dialogs/task-dialog/edit-task-dialog.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/contexts/projectContext";
import TaskName from "./sub-component/task-name";
import TaskDescription from "./sub-component/task-description";
import PrioritySelector from "./sub-component/priority-selector";

interface EditTaskDialogProps {
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
  // Props untuk data form
  title: string;
  description: string;
  priority: Task["priority"];
  // Setters untuk data form
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setPriority: (value: Task["priority"]) => void;
  // Info tambahan
  boardName: string;
}

// Fungsi helper warna, sama seperti di file asli
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

export default function EditTaskDialog({
  isOpen,
  isSaving,
  onClose,
  onSave,
  title,
  description,
  priority,
  setTitle,
  setDescription,
  setPriority,
  boardName,
}: EditTaskDialogProps) {
  const truncateBoardName = (name: string, maxLength: number = 30) => {
    return name.length <= maxLength ? name : name.slice(0, maxLength) + "...";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogContent className="max-w-md poppins overflow-hidden">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Editing task in &quot;{truncateBoardName(boardName)}&quot; board
            </p>
          </DialogHeader>
          <div className="space-y-4 py-4 overflow-hidden">
            <div className="space-y-2">
              <TaskName value={title} onChange={setTitle} onEnter={onSave} />
            </div>
            <TaskDescription
              value={description}
              onChange={setDescription}
              onEnter={onSave}
            />
            <PrioritySelector
              selectedPriority={priority}
              onSelectPriority={setPriority}
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Current:</span>
              <Badge
                variant="outline"
                className={`text-xs ${getPriorityColor(priority)}`}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Badge>
            </div>
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
              onClick={onClose}
              disabled={isSaving}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={onSave}
              disabled={!title.trim() || title.length < 3 || isSaving}
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
  );
}
