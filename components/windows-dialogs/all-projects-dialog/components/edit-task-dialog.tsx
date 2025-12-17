import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Task } from "@/types";

interface EditTaskDialogProps {
  task: Task;
  boardId: string;
  boardName: string;
  projectName: string;
  onSave: (task: Task, updatedData: Partial<Task>, boardId: string) => void;
  onClose: () => void;
}

export function EditTaskDialog({
  task,
  boardId,
  boardName,
  projectName,
  onSave,
  onClose,
}: EditTaskDialogProps) {
  const [title, setTitle] = useState(task.title);
  // Perbaikan: Tambahkan fallback || "" agar description tidak null
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState<Task["priority"]>(task.priority);

  const handleSave = () => {
    const updatedData: Partial<Task> = {
      title: title.trim(),
      description: description.trim(),
      priority,
    };

    onSave(task, updatedData, boardId);
  };

  const priorityOptions = [
    { value: "low", label: "Low Priority" },
    { value: "medium", label: "Medium Priority" },
    { value: "high", label: "High Priority" },
    { value: "critical", label: "Critical Priority" },
  ] as const;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Editing task in &quot;{boardName}&quot; board of &quot;{projectName}
            &quot; project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              className="w-full min-h-[100px] px-3 py-2 text-sm bg-background border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Priority</label>
            <div className="grid grid-cols-1 gap-2">
              {priorityOptions.map((option) => {
                const isSelected = priority === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setPriority(option.value as Task["priority"])
                    }
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium capitalize">
                        {option.label}
                      </span>
                      {isSelected && (
                        <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim()}
            className="w-full sm:w-auto"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
