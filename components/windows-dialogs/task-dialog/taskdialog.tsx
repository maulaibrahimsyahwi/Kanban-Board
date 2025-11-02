"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  TaskName,
  TaskDescription,
} from "./sub-component/task-input-components";
import { BiTask } from "react-icons/bi";
import { useState, useEffect } from "react";
import { useProjects } from "@/contexts/projectContext";
import { Task } from "@/types";
import PrioritySelector from "./sub-component/priority-selector";
import LabelSelector from "./sub-component/label-selector";
import { TaskChecklist } from "./sub-component/task-checklist";
import { CgGoogleTasks } from "react-icons/cg";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { DatePicker } from "../../ui/date-picker";
import { Plus } from "lucide-react";
import ProgressSelector from "./sub-component/progress-selector";
import { cn } from "@/lib/utils";

interface TaskDialogProps {
  boardId?: string;
  trigger?: React.ReactNode;
}

export default function TaskDialog({ boardId, trigger }: TaskDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { addTaskToProject, selectedProject } = useProjects();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [progress, setProgress] = useState<Task["progress"]>("not-started");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [labels, setLabels] = useState<Task["labels"]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState(boardId);

  const [checklist, setChecklist] = useState<Task["checklist"]>([]);
  const [cardDisplayPreference, setCardDisplayPreference] =
    useState<Task["cardDisplayPreference"]>("none");

  useEffect(() => {
    setSelectedBoardId(boardId);
  }, [boardId]);

  const isFormValid =
    title.trim().length >= 3 && title.trim().length <= 50 && selectedBoardId;

  const handleDisplayPreferenceChange = (
    preference: "description" | "checklist"
  ) => {
    setCardDisplayPreference((current: Task["cardDisplayPreference"]) =>
      current === preference ? "none" : preference
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProject) {
      console.error("No project selected");
      return;
    }

    if (!isFormValid) return;

    setIsCreating(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const targetBoardId = selectedBoardId;
      if (!targetBoardId) {
        toast.error("Failed to create task", {
          description: "No board selected.",
        });
        return;
      }

      addTaskToProject(
        {
          title: title.trim(),
          description,
          priority,
          progress,
          startDate: startDate,
          dueDate: dueDate,
          labels: labels,
          checklist: checklist,
          cardDisplayPreference: cardDisplayPreference,
        },
        targetBoardId
      );

      const targetBoard = selectedProject.boards.find(
        (board) => board.id === targetBoardId
      );
      const boardName = targetBoard?.name || "Unknown Board";

      toast.success("Task created successfully", {
        description: `"${title.trim()}" has been added to ${boardName}.`,
        duration: 5000,
      });

      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating task:", error);

      toast.error("Failed to create task", {
        description:
          "An error occurred while creating the task. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setProgress("not-started");
    setStartDate(null);
    setDueDate(null);
    setLabels([]);
    setSelectedBoardId(boardId);
    setChecklist([]);
    setCardDisplayPreference("none");
  };

  const handleCancel = () => {
    resetForm();
    setIsOpen(false);
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
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button className="rounded-3xl px-4 cursor-pointer">
            <CgGoogleTasks />
            New Task
          </Button>
        )}
      </DialogTrigger>

      <DialogContent
        className={cn(
          "poppins sm:max-w-lg poppins top-10 translate-y-0 overflow-y-auto max-h-[90vh]",
          "dialog-scrollable-content"
        )}
      >
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
                Add a new task to &quot;{selectedProject.name}&quot;
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator className="my-1" />

        <form onSubmit={handleSubmit} className="space-y-5 overflow-hidden">
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
                    onChange={() =>
                      handleDisplayPreferenceChange("description")
                    }
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <Label
                    htmlFor="displayDesc"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Tampilkan pada kartu
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
                  <Label
                    htmlFor="displayChecklist"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Tampilkan pada kartu
                  </Label>
                </div>
              }
            />

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-4">
                <LabelSelector
                  selectedLabels={labels}
                  onLabelsChange={setLabels}
                />
                <div className="space-y-2">
                  <Label htmlFor="board-select" className="text-sm font-medium">
                    Wadah
                  </Label>
                  <select
                    id="board-select"
                    value={selectedBoardId || ""}
                    onChange={(e) => setSelectedBoardId(e.target.value)}
                    className="w-full h-11 border border-input bg-background rounded-md px-3 text-sm"
                  >
                    <option value="" disabled>
                      Pilih wadah...
                    </option>
                    {selectedProject.boards.map((board) => (
                      <option key={board.id} value={board.id}>
                        {board.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <ProgressSelector
                  selectedProgress={progress}
                  onSelectProgress={setProgress}
                />
                <PrioritySelector
                  selectedPriority={priority}
                  onSelectPriority={setPriority}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date" className="text-sm font-medium">
                  Tanggal mulai
                </Label>
                <DatePicker
                  date={startDate}
                  onDateChange={setStartDate}
                  placeholder="Pilih tanggal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due-date" className="text-sm font-medium">
                  Tenggat waktu
                </Label>
                <DatePicker
                  date={dueDate}
                  onDateChange={setDueDate}
                  placeholder="Pilih tanggal"
                />
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isCreating}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="cursor-pointer min-w-[130px]"
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
      </DialogContent>
    </Dialog>
  );
}
