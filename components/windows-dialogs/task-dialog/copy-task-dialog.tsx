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
      toast.error("Nama tugas baru dan wadah tidak boleh kosong.");
      return;
    }

    setIsCopying(true);

    // Perbaikan: Menggunakan Partial<Task> agar tidak perlu field wajib seperti updatedAt/boardId
    const newTaskData: Partial<Task> = {
      title: copyTaskName.trim(),
      description: copyOptions.description ? task.description : "",
      priority: task.priority,
      progress: copyOptions.progress ? task.progress : "not-started",
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
      toast.success("Tugas berhasil disalin", {
        description: `"${newTaskData.title}" telah ditambahkan.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast.error("Gagal menyalin tugas.");
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
            Salin Tugas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="copy-task-name">Nama tugas baru</Label>
            <Input
              id="copy-task-name"
              value={copyTaskName}
              onChange={(e) => setCopyTaskName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="copy-project-select">Nama rencana</Label>
            <Select
              value={copyTargetProjectId}
              onValueChange={handleProjectChange}
            >
              <SelectTrigger id="copy-project-select">
                <SelectValue placeholder="Pilih proyek..." />
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
            <Label htmlFor="copy-board-select">Nama wadah</Label>
            <Select
              value={copyTargetBoardId}
              onValueChange={setCopyTargetBoardId}
              disabled={availableBoards.length === 0}
            >
              <SelectTrigger id="copy-board-select">
                <SelectValue placeholder="Pilih wadah..." />
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
            <Label>Sertakan</Label>
            <p className="text-xs text-muted-foreground">
              Beberapa detail tugas tidak dapat disalin di seluruh rencana.
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
                  Kemajuan
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
                  Hari
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
                  Deskripsi
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
                  Daftar Periksa
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
                  Label
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
            Batal
          </Button>
          <Button
            onClick={handleCopyTask}
            disabled={isCopying || !copyTaskName.trim() || !copyTargetBoardId}
            className="min-w-[100px]"
          >
            {isCopying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salin"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
