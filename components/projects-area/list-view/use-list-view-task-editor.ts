import type { Attachment, Board, Task, UserProfile } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TaskToEditInfo {
  originalTask: Task;
  boardId: string;
  boardName: string;
}

export function useListViewTaskEditor({
  boards,
  editTask,
  moveTask,
  onUpdated,
}: {
  boards?: Board[];
  editTask: (taskId: string, boardId: string, updatedTask: Partial<Task>) => void;
  moveTask: (
    taskId: string,
    fromBoardId: string,
    toBoardId: string,
    newIndex?: number
  ) => void;
  onUpdated: () => void;
}) {
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

  useEffect(() => {
    if (!taskToEditInfo) return;

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
  }, [taskToEditInfo]);

  const openEditor = (task: Task, boardId: string, boardName: string) => {
    setTaskToEditInfo({ originalTask: task, boardId, boardName });
  };

  const closeEditor = () => {
    setTaskToEditInfo(null);
  };

  const save = async () => {
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
        const newBoard = boards?.find((b) => b.id === editBoardId);
        toastDescription = `Tugas dipindahkan ke ${newBoard?.name || "board baru"}.`;
      }

      toast.success("Tugas berhasil disimpan", {
        description: toastDescription,
      });
      onUpdated();
      closeEditor();
    } catch (error) {
      toast.error("Gagal menyimpan tugas");
      console.error("Gagal menyimpan tugas:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    taskToEditInfo,
    isSaving,
    editTitle,
    editDescription,
    editPriority,
    editProgress,
    editStartDate,
    editDueDate,
    editLabels,
    editBoardId,
    editChecklist,
    editCardDisplayPreference,
    editAssignees,
    editAttachments,
    setEditTitle,
    setEditDescription,
    setEditPriority,
    setEditProgress,
    setEditStartDate,
    setEditDueDate,
    setEditLabels,
    setEditBoardId,
    setEditChecklist,
    setEditCardDisplayPreference,
    setEditAssignees,
    setEditAttachments,
    openEditor,
    closeEditor,
    save,
  };
}

