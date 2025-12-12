"use client";

import * as React from "react";
import { useProjects } from "@/contexts/projectContext";
import { Task, Board } from "@/types";
import { cn } from "@/lib/utils";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import PrioritySelector from "@/components/windows-dialogs/task-dialog/sub-component/priority-selector";
import ProgressSelector from "@/components/windows-dialogs/task-dialog/sub-component/progress-selector";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CompactDatePicker } from "./ListViewHelpers";

interface NewTaskRowProps {
  boards: Board[];
  onTaskAdded: () => void;
}

export const NewTaskRow: React.FC<NewTaskRowProps> = ({
  boards,
  onTaskAdded,
}) => {
  const { addTaskToProject, selectedProject } = useProjects();
  const defaultBoard = boards[0]?.id || "";

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [boardId, setBoardId] = useState(defaultBoard);
  const [progress, setProgress] = useState<Task["progress"]>("not-started");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [isCreating, setIsCreating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node) &&
        !(
          event.target instanceof HTMLElement &&
          event.target.closest('[data-slot="dropdown-menu-content"]')
        )
      ) {
        if (isExpanded && !title.trim()) {
          setIsExpanded(false);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded, title]);

  const canCreate = title.trim().length >= 3 && boardId && !isCreating;

  const handleCreateTask = async () => {
    if (!canCreate || !selectedProject) return;

    setIsCreating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newTaskData: Partial<Task> = {
        title: title.trim(),
        description: "",
        priority: priority,
        progress: progress,
        startDate: startDate,
        dueDate: dueDate,
        labels: [],
        checklist: [],
        cardDisplayPreference: "none",
        assignees: [],
        attachments: [],
      };
      addTaskToProject(newTaskData, boardId, selectedProject.id);

      toast.success("Tugas baru berhasil ditambahkan", {
        description: `"${title.trim()}" telah ditambahkan ke ${
          boards.find((b) => b.id === boardId)?.name || "Board"
        }.`,
      });
      setTitle("");
      setStartDate(null);
      setDueDate(null);
      setBoardId(defaultBoard);
      setProgress("not-started");
      setPriority("medium");
      setIsExpanded(false);
      onTaskAdded();
    } catch (error) {
      toast.error("Gagal menambahkan tugas." + (error as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreateTask();
    }
  };

  if (!isExpanded) {
    return (
      <div
        className="flex items-center text-sm text-foreground py-2.5 px-4 bg-muted/30 border-t border-border/50"
        ref={wrapperRef}
      >
        <Button
          variant="ghost"
          size="icon-sm"
          className="w-8 h-8 text-muted-foreground hover:bg-muted/70 hover:text-primary transition-colors duration-200 flex-shrink-0 mr-2"
          onClick={() => setIsExpanded(true)}
        >
          <Plus className="w-4 h-4" />
        </Button>
        <Input
          placeholder="Tambahkan tugas baru..."
          className="h-7 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 shadow-none cursor-pointer"
          onFocus={() => setIsExpanded(true)}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className="grid grid-cols-[1.5fr_150px_150px_150px_120px_180px_160px_150px_80px] items-center text-sm text-foreground py-2.5 px-4 bg-muted/30 border-t border-border/50"
    >
      <div className="font-medium truncate pr-2 flex items-center">
        <Loader2
          className={cn(
            "w-4 h-4 text-primary mr-2",
            isCreating ? "animate-spin" : "opacity-0"
          )}
        />
        <Input
          placeholder="Tambahkan tugas baru"
          className="h-7 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 shadow-none"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isCreating}
        />
      </div>

      <div className="text-muted-foreground truncate pr-2">
        <Input
          placeholder="Tugas"
          className="h-7 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 shadow-none text-muted-foreground"
          disabled={true}
        />
      </div>

      <div className="text-muted-foreground truncate pr-2">
        <CompactDatePicker
          date={startDate}
          onDateChange={setStartDate}
          placeholder={"-"}
          isOverdue={false}
        />
      </div>

      <div className="truncate pr-2">
        <CompactDatePicker
          date={dueDate}
          onDateChange={setDueDate}
          placeholder={"-"}
          isOverdue={false}
        />
      </div>

      <div className="truncate pr-2">
        <Select value={boardId} onValueChange={setBoardId}>
          <SelectTrigger
            className="h-7 p-1 text-xs border-dashed text-muted-foreground"
            size="sm"
          >
            <SelectValue placeholder="Pilih wadah" />
          </SelectTrigger>
          <SelectContent>
            {boards.map((board) => (
              <SelectItem key={board.id} value={board.id}>
                {board.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="pr-2 w-fit">
        <ProgressSelector
          selectedProgress={progress}
          onSelectProgress={setProgress}
          size="sm"
        />
      </div>

      <div className="pr-2 w-fit">
        <PrioritySelector
          selectedPriority={priority}
          onSelectPriority={setPriority}
          size="sm"
        />
      </div>

      <div className="flex flex-wrap gap-1">
        <span className="text-primary text-xs cursor-pointer hover:underline">
          Tambahkan label
        </span>
      </div>

      <div className="flex items-center justify-end">
        <Button
          variant="ghost"
          size="icon-sm"
          className="w-8 h-8 text-primary hover:bg-primary/10"
          onClick={handleCreateTask}
          disabled={!canCreate}
        >
          {isCreating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
