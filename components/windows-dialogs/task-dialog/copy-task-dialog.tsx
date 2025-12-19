"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Task } from "@/types";
import { useProjects } from "@/contexts/projectContext";
import { toast } from "sonner";
import { Copy, Loader2 } from "lucide-react";

interface CopyTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  currentBoardId: string;
}

interface CopyOptions {
  progress: boolean;
  dates: boolean;
  description: boolean;
  checklist: boolean;
  labels: boolean;
}

export default function CopyTaskDialog({
  isOpen,
  onOpenChange,
  task,
  currentBoardId,
}: CopyTaskDialogProps) {
  const { projects, selectedProject, addTaskToProject } = useProjects();
  const [isCopying, setIsCopying] = useState(false);

  const [copyTaskName, setCopyTaskName] = useState(task.title);
  const [copyTargetProjectId, setCopyTargetProjectId] = useState(
    selectedProject?.id || ""
  );
  const [copyTargetBoardId, setCopyTargetBoardId] = useState(currentBoardId);
  const [copyOptions, setCopyOptions] = useState<CopyOptions>({
    progress: false,
    dates: false,
    description: true,
    checklist: true,
    labels: true,
  });

  useEffect(() => {
    if (isOpen) {
      setCopyTaskName(task.title);
      setCopyTargetProjectId(selectedProject?.id || "");
      setCopyTargetBoardId(currentBoardId);
      setCopyOptions({
        progress: false,
        dates: false,
        description: true,
        checklist: true,
        labels: true,
      });
    }
  }, [isOpen, task, selectedProject, currentBoardId]);

  const availableBoards = useMemo(() => {
    const project = projects.find((p) => p.id === copyTargetProjectId);
    return project ? project.boards : [];
  }, [projects, copyTargetProjectId]);

  const handleOptionChange = (option: keyof CopyOptions) => {
    setCopyOptions((prev) => ({ ...prev, [option]: !prev[option] }));
  };

  const handleProjectChange = (projectId: string) => {
    setCopyTargetProjectId(projectId);
    const targetProject = projects.find((p) => p.id === projectId);
    if (targetProject && targetProject.boards.length > 0) {
      setCopyTargetBoardId(targetProject.boards[0].id);
    } else {
      setCopyTargetBoardId("");
    }
  };

  const handleCopyTask = async () => {
    if (!copyTaskName.trim() || !copyTargetBoardId) {
      toast.error("New task name and board are required.");
      return;
    }

    setIsCopying(true);

    // Perbaikan: Menggunakan Partial<Task> agar tidak perlu field wajib seperti updatedAt/boardId
    const newTaskData: Partial<Task> = {
      title: copyTaskName.trim(),
      description: copyOptions.description ? task.description : "",
      priority: task.priority,
      progress: copyOptions.progress ? task.progress : "not_started",
      startDate: copyOptions.dates ? task.startDate : null,
      dueDate: copyOptions.dates ? task.dueDate : null,
      labels: copyOptions.labels ? task.labels : [],
      checklist: copyOptions.checklist ? task.checklist : [],
      cardDisplayPreference: copyOptions.checklist
        ? task.cardDisplayPreference
        : "none",
      assignees: [],
      attachments: [],
    };

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      addTaskToProject(newTaskData, copyTargetBoardId, copyTargetProjectId);
      toast.success("Task copied", {
        description: `"${newTaskData.title}" has been added.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to copy task.");
      console.error(error);
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5" />
            Copy Task
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="copy-task-name">New task name</Label>
            <Input
              id="copy-task-name"
              value={copyTaskName}
              onChange={(e) => setCopyTaskName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="copy-project-select">Project</Label>
            <Select
              value={copyTargetProjectId}
              onValueChange={handleProjectChange}
            >
              <SelectTrigger id="copy-project-select">
                <SelectValue placeholder="Select a project..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="copy-board-select">Board</Label>
            <Select
              value={copyTargetBoardId}
              onValueChange={setCopyTargetBoardId}
              disabled={availableBoards.length === 0}
            >
              <SelectTrigger id="copy-board-select">
                <SelectValue placeholder="Select a board..." />
              </SelectTrigger>
              <SelectContent>
                {availableBoards.map((board) => (
                  <SelectItem key={board.id} value={board.id}>
                    {board.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

            <div className="space-y-2 pt-2">
              <Label>Include</Label>
              <p className="text-xs text-muted-foreground">
              Some task details can&apos;t be copied across projects.
              </p>
              <div className="space-y-2 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                  id="copy-progress"
                  checked={copyOptions.progress}
                  onCheckedChange={() => handleOptionChange("progress")}
                />
                <Label
                  htmlFor="copy-progress"
                  className="font-normal cursor-pointer"
                >
                  Progress
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="copy-dates"
                  checked={copyOptions.dates}
                  onCheckedChange={() => handleOptionChange("dates")}
                />
                <Label
                  htmlFor="copy-dates"
                  className="font-normal cursor-pointer"
                >
                  Dates
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="copy-description"
                  checked={copyOptions.description}
                  onCheckedChange={() => handleOptionChange("description")}
                />
                <Label
                  htmlFor="copy-description"
                  className="font-normal cursor-pointer"
                >
                  Description
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="copy-checklist"
                  checked={copyOptions.checklist}
                  onCheckedChange={() => handleOptionChange("checklist")}
                />
                <Label
                  htmlFor="copy-checklist"
                  className="font-normal cursor-pointer"
                >
                  Checklist
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="copy-labels"
                  checked={copyOptions.labels}
                  onCheckedChange={() => handleOptionChange("labels")}
                />
                <Label
                  htmlFor="copy-labels"
                  className="font-normal cursor-pointer"
                >
                  Labels
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isCopying}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCopyTask}
            disabled={isCopying || !copyTaskName.trim() || !copyTargetBoardId}
            className="min-w-[100px]"
          >
            {isCopying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Copy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
