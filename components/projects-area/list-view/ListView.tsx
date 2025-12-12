"use client";

import * as React from "react";
import { useProjects } from "@/contexts/projectContext";
import { Task, Board, UserProfile, Attachment } from "@/types";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { useMemo, useState, useEffect, useCallback } from "react";
import { EditableTaskRow } from "./EditableTaskRow";
import { NewTaskRow } from "./NewTaskRow";
import EditTaskDialog from "@/components/windows-dialogs/task-dialog/edit-task-dialog";
import { toast } from "sonner";

type SortKey =
  | "title"
  | "startDate"
  | "dueDate"
  | "boardName"
  | "progress"
  | "priority"
  | "none";

type SortDirection = "asc" | "desc";

const priorityOrder: { [key in Task["priority"]]: number } = {
  urgent: 4,
  important: 3,
  medium: 2,
  low: 1,
};

const progressOrder: { [key in Task["progress"]]: number } = {
  "not-started": 0,
  "in-progress": 1,
  completed: 2,
};

const SortableHeader = ({
  label,
  sortKey,
  currentSortKey,
  currentDirection,
  onClick,
}: {
  label: string;
  sortKey: SortKey;
  currentSortKey: SortKey;
  currentDirection: SortDirection;
  onClick: (key: SortKey) => void;
}) => {
  const isCurrent = currentSortKey === sortKey;
  const Icon = isCurrent
    ? currentDirection === "asc"
      ? ChevronUp
      : ChevronDown
    : ChevronsUpDown;

  return (
    <div
      className={cn(
        "flex items-center gap-1 cursor-pointer select-none",
        "hover:text-foreground transition-colors",
        isCurrent ? "text-foreground" : "text-muted-foreground/80"
      )}
      onClick={() => onClick(sortKey)}
    >
      <span>{label}</span>
      <Icon className="w-3 h-3 flex-shrink-0" />
    </div>
  );
};

interface TaskToEditInfo {
  originalTask: Task;
  boardId: string;
  boardName: string;
}

interface ListViewProps {
  filteredBoards: Board[];
}

export default function ListView({ filteredBoards }: ListViewProps) {
  const { selectedProject, editTask, moveTask } = useProjects();
  const [tasksUpdated, setTasksUpdated] = useState(0);

  const [sortBy, setSortBy] = useState<SortKey>("none");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const [taskToEditInfo, setTaskToEditInfo] = useState<TaskToEditInfo | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<Task["priority"]>("medium");
  const [editProgress, setEditProgress] =
    useState<Task["progress"]>("not-started");
  const [editStartDate, setEditStartDate] = useState<Date | null>(null);
  const [editDueDate, setEditDueDate] = useState<Date | null>(null);
  const [editLabels, setEditLabels] = useState<Task["labels"]>([]);
  const [editBoardId, setEditBoardId] = useState("");
  const [editChecklist, setEditChecklist] = useState<Task["checklist"]>([]);
  const [editCardDisplayPreference, setEditCardDisplayPreference] =
    useState<Task["cardDisplayPreference"]>("none");

  const [editAssignees, setEditAssignees] = useState<UserProfile[]>([]);
  const [editAttachments, setEditAttachments] = useState<Attachment[]>([]);

  const sortTasks = useCallback(
    (
      a: Task & { boardName: string; boardId: string },
      b: Task & { boardName: string; boardId: string }
    ) => {
      const direction = sortDirection === "asc" ? 1 : -1;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let valA: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let valB: any;

      switch (sortBy) {
        case "title":
          valA = a.title.toLowerCase();
          valB = b.title.toLowerCase();
          return direction * (valA < valB ? -1 : valA > valB ? 1 : 0);
        case "startDate":
        case "dueDate":
          valA = a[sortBy] ? new Date(a[sortBy] as Date).getTime() : 0;
          valB = b[sortBy] ? new Date(b[sortBy] as Date).getTime() : 0;
          if (valA === 0 && valB !== 0) return direction * 1;
          if (valA !== 0 && valB === 0) return direction * -1;
          return direction * (valA - valB);
        case "boardName":
          valA = a.boardName.toLowerCase();
          valB = b.boardName.toLowerCase();
          return direction * (valA < valB ? -1 : valA > valB ? 1 : 0);
        case "progress":
          valA = progressOrder[a.progress];
          valB = progressOrder[b.progress];
          return direction * (valA - valB);
        case "priority":
          const pA = a.priority as keyof typeof priorityOrder;
          const pB = b.priority as keyof typeof priorityOrder;
          valA = priorityOrder[pA] || 0;
          valB = priorityOrder[pB] || 0;
          return direction * (valA - valB);
        default:
          return 0;
      }
    },
    [sortBy, sortDirection]
  );

  useEffect(() => {
    if (taskToEditInfo) {
      const task = taskToEditInfo.originalTask;
      setEditTitle(task.title);
      setEditDescription(task.description || "");
      setEditPriority(task.priority);
      setEditProgress(task.progress);
      setEditStartDate(task.startDate);
      setEditDueDate(task.dueDate);
      setEditLabels(task.labels);
      setEditBoardId(taskToEditInfo.boardId);
      setEditChecklist(task.checklist);
      setEditCardDisplayPreference(task.cardDisplayPreference);

      setEditAssignees(task.assignees || []);
      setEditAttachments(task.attachments || []);

      setIsSaving(false);
    }
  }, [taskToEditInfo]);

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDirection("asc");
    }
  };

  const tasksWithBoardInfo = useMemo(() => {
    const allTasks = filteredBoards.flatMap((board: Board) =>
      board.tasks.map((task: Task) => ({
        ...task,
        boardName: board.name,
        boardId: board.id,
      }))
    );

    if (sortBy !== "none") {
      return [...allTasks].sort(sortTasks);
    }
    return allTasks;
  }, [filteredBoards, tasksUpdated, sortBy, sortTasks]);

  const handleOpenEditDialog = (
    task: Task,
    boardId: string,
    boardName: string
  ) => {
    setTaskToEditInfo({ originalTask: task, boardId, boardName });
  };

  const handleCloseEditDialog = () => {
    setTaskToEditInfo(null);
  };

  const handleSaveEdit = async () => {
    if (!taskToEditInfo) return;

    setIsSaving(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const originalBoardId = taskToEditInfo.boardId;
      const taskId = taskToEditInfo.originalTask.id;

      const updatedData: Partial<Task> = {
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority,
        progress: editProgress,
        startDate: editStartDate,
        dueDate: editDueDate,
        labels: editLabels,
        checklist: editChecklist,
        cardDisplayPreference: editCardDisplayPreference,
        assignees: editAssignees,
        attachments: editAttachments,
      };

      editTask(taskId, originalBoardId, updatedData);

      let toastDescription = `"${editTitle.trim()}" telah diperbarui.`;

      if (editBoardId !== originalBoardId) {
        moveTask(taskId, originalBoardId, editBoardId);
        const newBoard = selectedProject?.boards.find(
          (b) => b.id === editBoardId
        );
        toastDescription = `Tugas dipindahkan ke ${
          newBoard?.name || "board baru"
        }.`;
      }

      toast.success("Tugas berhasil disimpan", {
        description: toastDescription,
      });
      setTasksUpdated((prev) => prev + 1);
      handleCloseEditDialog();
    } catch (error) {
      toast.error("Gagal menyimpan tugas");
      console.error("Gagal menyimpan tugas:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedProject) return null;

  return (
    <>
      <div className="h-full w-full overflow-auto">
        <div className="min-w-[1500px] bg-card border border-border rounded-xl flex flex-col h-full">
          <div className="grid grid-cols-[1.5fr_150px_150px_150px_120px_180px_160px_150px_80px] text-sm font-semibold text-muted-foreground border-b border-border/50 py-3 px-4 z-10 flex-shrink-0 bg-card">
            <SortableHeader
              label="Nama Tugas"
              sortKey="title"
              currentSortKey={sortBy}
              currentDirection={sortDirection}
              onClick={handleSort}
            />
            <div className="text-muted-foreground/80">Tugas</div>
            <SortableHeader
              label="Tanggal mulai"
              sortKey="startDate"
              currentSortKey={sortBy}
              currentDirection={sortDirection}
              onClick={handleSort}
            />
            <SortableHeader
              label="Tenggat Waktu"
              sortKey="dueDate"
              currentSortKey={sortBy}
              currentDirection={sortDirection}
              onClick={handleSort}
            />
            <SortableHeader
              label="Wadah"
              sortKey="boardName"
              currentSortKey={sortBy}
              currentDirection={sortDirection}
              onClick={handleSort}
            />
            <SortableHeader
              label="Kemajuan"
              sortKey="progress"
              currentSortKey={sortBy}
              currentDirection={sortDirection}
              onClick={handleSort}
            />
            <SortableHeader
              label="Prioritas"
              sortKey="priority"
              currentSortKey={sortBy}
              currentDirection={sortDirection}
              onClick={handleSort}
            />
            <div className="text-muted-foreground/80">Label</div>
            <div className="text-right text-muted-foreground/80">
              Lihat sekilas
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-border/50">
              {tasksWithBoardInfo.map(
                (task: Task & { boardName: string; boardId: string }) => (
                  <EditableTaskRow
                    key={task.id}
                    task={task}
                    boardId={task.boardId}
                    boards={selectedProject.boards}
                    onUpdate={() => setTasksUpdated((prev) => prev + 1)}
                    onOpenEditDialog={handleOpenEditDialog}
                  />
                )
              )}
            </div>

            <NewTaskRow
              boards={selectedProject.boards}
              onTaskAdded={() => setTasksUpdated((prev) => prev + 1)}
            />
          </div>
        </div>
      </div>

      {taskToEditInfo && taskToEditInfo.originalTask && selectedProject && (
        <EditTaskDialog
          isOpen={true}
          isSaving={isSaving}
          onClose={handleCloseEditDialog}
          onSave={handleSaveEdit}
          title={editTitle}
          description={editDescription}
          priority={editPriority}
          progress={editProgress}
          startDate={editStartDate}
          dueDate={editDueDate}
          editLabels={editLabels}
          editBoardId={editBoardId}
          editChecklist={editChecklist}
          editCardDisplayPreference={editCardDisplayPreference}
          setTitle={setEditTitle}
          setDescription={setEditDescription}
          setPriority={setEditPriority}
          setProgress={setEditProgress}
          setStartDate={setEditStartDate}
          setDueDate={setEditDueDate}
          setEditLabels={setEditLabels}
          setEditBoardId={setEditBoardId}
          setEditChecklist={setEditChecklist}
          setEditCardDisplayPreference={setEditCardDisplayPreference}
          boards={selectedProject.boards}
          boardName={taskToEditInfo.boardName}
          editAssignees={editAssignees}
          setEditAssignees={setEditAssignees}
          editAttachments={editAttachments}
          setEditAttachments={setEditAttachments}
        />
      )}
    </>
  );
}
