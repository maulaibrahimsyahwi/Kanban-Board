"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";

import { Plus } from "lucide-react";
import { BiTask } from "react-icons/bi";

import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

import TaskDescription from "./sub-component/task-description";
import { TaskChecklist } from "./sub-component/task-checklist";
import TaskName from "./sub-component/task-name";
import LabelSelector from "./sub-component/label-selector";
import PrioritySelector from "./sub-component/priority-selector";
import ProgressSelector from "./sub-component/progress-selector";
import { DatePicker } from "../../ui/date-picker";

type CreateTaskDialogContentProps = {
  projectName: string;
  boards: { id: string; name: string }[];

  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  description: string;
  setDescription: Dispatch<SetStateAction<string>>;
  priority: Task["priority"];
  setPriority: Dispatch<SetStateAction<Task["priority"]>>;
  progress: Task["progress"];
  setProgress: Dispatch<SetStateAction<Task["progress"]>>;
  startDate: Date | null;
  setStartDate: Dispatch<SetStateAction<Date | null>>;
  dueDate: Date | null;
  setDueDate: Dispatch<SetStateAction<Date | null>>;
  labels: Task["labels"];
  setLabels: Dispatch<SetStateAction<Task["labels"]>>;
  selectedBoardId: string | undefined;
  setSelectedBoardId: Dispatch<SetStateAction<string | undefined>>;
  checklist: Task["checklist"];
  setChecklist: Dispatch<SetStateAction<Task["checklist"]>>;
  cardDisplayPreference: Task["cardDisplayPreference"];
  setCardDisplayPreference: Dispatch<SetStateAction<Task["cardDisplayPreference"]>>;

  isCreating: boolean;
  isFormValid: boolean;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
};

export function CreateTaskDialogContent({
  projectName,
  boards,
  title,
  setTitle,
  description,
  setDescription,
  priority,
  setPriority,
  progress,
  setProgress,
  startDate,
  setStartDate,
  dueDate,
  setDueDate,
  labels,
  setLabels,
  selectedBoardId,
  setSelectedBoardId,
  checklist,
  setChecklist,
  cardDisplayPreference,
  setCardDisplayPreference,
  isCreating,
  isFormValid,
  onSubmit,
  onCancel,
}: CreateTaskDialogContentProps) {
  const handleDisplayPreferenceChange = (preference: "description" | "checklist") => {
    setCardDisplayPreference((current) => (current === preference ? "none" : preference));
  };

  return (
    <>
      <DialogHeader className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-muted rounded-full flex justify-center items-center">
            <BiTask className="text-xl text-muted-foreground" />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold text-left">
              Create New Task
            </DialogTitle>
            <DialogDescription className="text-left">
              Add a new task to &quot;{projectName}&quot;
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <Separator className="my-1" />

      <form onSubmit={onSubmit} className="space-y-5 overflow-hidden">
        <div className="space-y-4">
          <TaskName value={title} onChange={setTitle} />

          <TaskDescription
            value={description}
            onChange={setDescription}
            actionSlot={
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="displayDesc"
                  name="cardDisplay"
                  checked={cardDisplayPreference === "description"}
                  onChange={() => handleDisplayPreferenceChange("description")}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <Label htmlFor="displayDesc" className="text-sm font-normal cursor-pointer">
                  Show on card
                </Label>
              </div>
            }
          />

          <TaskChecklist
            items={checklist}
            onChange={setChecklist}
            actionSlot={
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="displayChecklist"
                  name="cardDisplay"
                  checked={cardDisplayPreference === "checklist"}
                  onChange={() => handleDisplayPreferenceChange("checklist")}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <Label htmlFor="displayChecklist" className="text-sm font-normal cursor-pointer">
                  Show on card
                </Label>
              </div>
            }
          />

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-4">
              <LabelSelector selectedLabels={labels} onLabelsChange={setLabels} />
              <div className="space-y-2">
                <Label htmlFor="board-select" className="text-sm font-medium">
                  Board
                </Label>
                <select
                  id="board-select"
                  value={selectedBoardId || ""}
                  onChange={(e) => setSelectedBoardId(e.target.value)}
                  className="w-full h-11 border border-input bg-background rounded-md px-3 text-sm"
                >
                  <option value="" disabled>
                    Select a board...
                  </option>
                  {boards.map((board) => (
                    <option key={board.id} value={board.id}>
                      {board.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <ProgressSelector selectedProgress={progress} onSelectProgress={setProgress} />
              <PrioritySelector selectedPriority={priority} onSelectPriority={setPriority} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-sm font-medium">
                Start date
              </Label>
              <DatePicker
                date={startDate}
                onDateChange={setStartDate}
                placeholder="Select date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due-date" className="text-sm font-medium">
                Due date
              </Label>
              <DatePicker
                date={dueDate}
                onDateChange={setDueDate}
                placeholder="Select date"
              />
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isCreating}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className={cn("cursor-pointer min-w-[130px]")}
            disabled={!isFormValid || isCreating}
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Task
              </>
            )}
          </Button>
        </div>
      </form>
    </>
  );
}
