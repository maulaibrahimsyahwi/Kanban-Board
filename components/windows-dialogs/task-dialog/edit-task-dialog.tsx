"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Task, Board } from "@/types";
import TaskName from "./sub-component/task-name";
import TaskDescription from "./sub-component/task-description";
import PrioritySelector from "./sub-component/priority-selector";
import LabelSelector from "./sub-component/label-selector";
import { DatePicker } from "@/components/ui/date-picker";

interface EditTaskDialogProps {
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
  title: string;
  description: string;
  priority: Task["priority"];
  progress: Task["progress"];
  startDate: Date | null;
  dueDate: Date | null;
  editLabels: Task["labels"];
  editBoardId: string;
  boards: Board[];
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setPriority: (value: Task["priority"]) => void;
  setProgress: (value: Task["progress"]) => void;
  setStartDate: (date: Date | null) => void;
  setDueDate: (date: Date | null) => void;
  setEditLabels: (value: Task["labels"]) => void;
  setEditBoardId: (value: string) => void;
  boardName: string;
}

export default function EditTaskDialog({
  isOpen,
  isSaving,
  onClose,
  onSave,
  title,
  description,
  priority,
  progress,
  startDate,
  dueDate,
  editLabels,
  editBoardId,
  boards,
  setTitle,
  setDescription,
  setPriority,
  setProgress,
  setStartDate,
  setDueDate,
  setEditLabels,
  setEditBoardId,
  boardName,
}: EditTaskDialogProps) {
  const truncateBoardName = (name: string, maxLength: number = 30) => {
    return name.length <= maxLength ? name : name.slice(0, maxLength) + "...";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogContent className="max-w-md poppins overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Editing task in &quot;{truncateBoardName(boardName)}&quot; board
            </p>
          </DialogHeader>
          <div className="space-y-4 py-4 overflow-hidden">
            <TaskName value={title} onChange={setTitle} onEnter={onSave} />
            <TaskDescription
              value={description}
              onChange={setDescription}
              onEnter={onSave}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <LabelSelector
                  selectedLabels={editLabels}
                  onLabelsChange={setEditLabels}
                />
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-board-select"
                    className="text-sm font-medium"
                  >
                    Wadah
                  </Label>
                  <select
                    id="edit-board-select"
                    value={editBoardId}
                    onChange={(e) => setEditBoardId(e.target.value)}
                    className="w-full h-11 border border-input bg-background rounded-md px-3 text-sm"
                  >
                    {boards.map((board) => (
                      <option key={board.id} value={board.id}>
                        {board.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-progress-select"
                    className="text-sm font-medium"
                  >
                    Kemajuan
                  </Label>
                  <select
                    id="edit-progress-select"
                    value={progress}
                    onChange={(e) =>
                      setProgress(e.target.value as Task["progress"])
                    }
                    className="w-full h-11 border border-input bg-background rounded-md px-3 text-sm"
                  >
                    <option value="not-started">Belum dimulai</option>
                    <option value="in-progress">Dalam proses</option>
                    <option value="completed">Selesai</option>
                  </select>
                </div>
                <PrioritySelector
                  selectedPriority={priority}
                  onSelectPriority={setPriority}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="edit-start-date"
                  className="text-sm font-medium"
                >
                  Tanggal mulai
                </Label>
                <DatePicker
                  date={startDate}
                  onDateChange={setStartDate}
                  placeholder="Pilih tanggal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-due-date" className="text-sm font-medium">
                  Tenggat waktu
                </Label>
                <DatePicker
                  date={dueDate}
                  onDateChange={setDueDate}
                  placeholder="Pilih tanggal"
                />
              </div>
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
