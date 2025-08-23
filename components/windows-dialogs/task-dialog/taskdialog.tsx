// components/windows-dialogs/task-dialog/taskdialog.tsx
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
import { useState } from "react";
import { useProjects } from "@/contexts/projectContext";
import { Task } from "@/contexts/projectContext";
import PrioritySelector from "./sub-component/priority-selector";
import { CgGoogleTasks } from "react-icons/cg";

// Props agar dialog ini bisa dipanggil dari mana saja
interface TaskDialogProps {
  boardId?: string; // Board spesifik jika dipanggil dari dalam board
  trigger?: React.ReactNode; // Custom trigger (misal: tombol "+ Add new task")
}

export default function TaskDialog({ boardId, trigger }: TaskDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { addTaskToProject, selectedProject } = useProjects();

  // State untuk form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("low");

  // Validasi
  const isFormValid = title.trim().length >= 3 && title.trim().length <= 50;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProject) {
      console.error("No project selected");
      return;
    }

    if (!isFormValid) return;

    // Default ke board pertama jika tidak ada boardId spesifik yang diberikan
    const targetBoardId = boardId || selectedProject.boards[0]?.id;
    if (!targetBoardId) {
      console.error("No board available to add the task to.");
      return;
    }

    addTaskToProject(
      { title: title.trim(), description, priority },
      targetBoardId
    );

    // Reset form dan tutup dialog
    resetForm();
    setIsOpen(false);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("low");
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
            {" "}
            <CgGoogleTasks />
            Add Task
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="poppins sm:max-w-[425px] poppins top-10 translate-y-0">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Task Title */}
            <TaskName value={title} onChange={setTitle} />

            {/* Task Description */}
            <TaskDescription value={description} onChange={setDescription} />

            {/* Priority */}
            <PrioritySelector
              selectedPriority={priority}
              onSelectPriority={setPriority}
            />
          </div>

          <Separator className="my-4" />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={!isFormValid}
            >
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
