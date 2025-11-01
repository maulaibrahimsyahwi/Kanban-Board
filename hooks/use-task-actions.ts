import { useState, useMemo, useEffect } from "react";
import { useProjects } from "@/contexts/projectContext";
import { Task } from "@/types";
import { toast } from "sonner";

export function useTaskActions(taskId: string, boardId: string) {
  const { selectedProject, deleteTask, moveTask, editTask } = useProjects();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const derivedData = useMemo(() => {
    if (!selectedProject) return null;

    const boards = selectedProject.boards;
    const currentBoardIndex = boards.findIndex((board) => board.id === boardId);
    if (currentBoardIndex === -1) return null;

    const currentBoard = boards[currentBoardIndex];
    const task = currentBoard.tasks.find((t) => t.id === taskId);
    if (!task) return null;

    const previousBoard =
      currentBoardIndex > 0 ? boards[currentBoardIndex - 1] : null;
    const nextBoard =
      currentBoardIndex < boards.length - 1
        ? boards[currentBoardIndex + 1]
        : null;
    const otherBoards = boards.filter((board) => board.id !== boardId);

    return { task, currentBoard, previousBoard, nextBoard, otherBoards };
  }, [selectedProject, taskId, boardId]);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<Task["priority"]>("medium");
  const [editProgress, setEditProgress] =
    useState<Task["progress"]>("not-started");
  const [editStartDate, setEditStartDate] = useState<Date | null>(null);
  const [editDueDate, setEditDueDate] = useState<Date | null>(null);
  const [editLabels, setEditLabels] = useState<Task["labels"]>([]);
  const [editBoardId, setEditBoardId] = useState<string>(boardId);

  useEffect(() => {
    if (derivedData?.task) {
      setEditTitle(derivedData.task.title);
      setEditDescription(derivedData.task.description);
      setEditPriority(derivedData.task.priority);
      setEditProgress(derivedData.task.progress);
      setEditStartDate(derivedData.task.startDate);
      setEditDueDate(derivedData.task.dueDate);
      setEditLabels(derivedData.task.labels || []);
      setEditBoardId(boardId);
    }
  }, [derivedData?.task, boardId]);

  const handleEditTask = () => {
    if (!derivedData?.task) return;
    setIsDropdownOpen(false);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || editTitle.length < 3 || !derivedData) return;

    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const taskUpdates: Partial<Task> = {
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority,
        progress: editProgress,
        startDate: editStartDate,
        dueDate: editDueDate,
        labels: editLabels,
      };

      editTask(taskId, boardId, taskUpdates);

      let toastDescription = `"${editTitle.trim()}" has been updated.`;

      if (editBoardId !== boardId) {
        moveTask(taskId, boardId, editBoardId);
        const newBoard = selectedProject?.boards.find(
          (b) => b.id === editBoardId
        );
        toastDescription = `Task moved to ${newBoard?.name || "new board"}.`;
      }

      toast.success("Task updated successfully", {
        description: toastDescription,
      });
      setIsEditDialogOpen(false);
    } catch {
      toast.error("Failed to update task");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTask = () => {
    deleteTask(taskId, boardId);
    setIsDropdownOpen(false);
  };

  const handleMoveToPrevious = () => {
    if (derivedData?.previousBoard) {
      moveTask(taskId, boardId, derivedData.previousBoard.id);
      setIsDropdownOpen(false);
    }
  };

  const handleMoveToNext = () => {
    if (derivedData?.nextBoard) {
      moveTask(taskId, boardId, derivedData.nextBoard.id);
      setIsDropdownOpen(false);
    }
  };

  const handleMoveTask = (targetBoardId: string) => {
    if (targetBoardId !== boardId) {
      moveTask(taskId, boardId, targetBoardId);
      setIsDropdownOpen(false);
    }
  };

  return {
    ...derivedData,
    isEditDialogOpen,
    isDropdownOpen,
    isSaving,
    editTitle,
    editDescription,
    editPriority,
    editProgress,
    editStartDate,
    editDueDate,
    editLabels,
    editBoardId,
    setIsDropdownOpen,
    setIsEditDialogOpen,
    setEditTitle,
    setEditDescription,
    setEditPriority,
    setEditProgress,
    setEditStartDate,
    setEditDueDate,
    setEditLabels,
    setEditBoardId,
    handleEditTask,
    handleSaveEdit,
    handleDeleteTask,
    handleMoveToPrevious,
    handleMoveToNext,
    handleMoveTask,
  };
}
