"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useProjects } from "@/contexts/projectContext";
import { Task } from "@/types";
import { CgGoogleTasks } from "react-icons/cg";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CreateTaskDialogContent } from "./create-task-dialog-content";

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
  const [progress, setProgress] = useState<Task["progress"]>("not_started");
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
          assignees: [],
          attachments: [],
        },
        targetBoardId,
        selectedProject.id
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
    setProgress("not_started");
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
        <CreateTaskDialogContent
          projectName={selectedProject.name}
          boards={selectedProject.boards}
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          priority={priority}
          setPriority={setPriority}
          progress={progress}
          setProgress={setProgress}
          startDate={startDate}
          setStartDate={setStartDate}
          dueDate={dueDate}
          setDueDate={setDueDate}
          labels={labels}
          setLabels={setLabels}
          selectedBoardId={selectedBoardId}
          setSelectedBoardId={setSelectedBoardId}
          checklist={checklist}
          setChecklist={setChecklist}
          cardDisplayPreference={cardDisplayPreference}
          setCardDisplayPreference={setCardDisplayPreference}
          isCreating={isCreating}
          isFormValid={!!isFormValid}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
