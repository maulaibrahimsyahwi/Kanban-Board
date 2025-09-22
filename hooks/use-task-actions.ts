// hooks/use-task-actions.ts
import { useState, useMemo } from "react";
import { useProjects } from "@/contexts/projectContext";
import { Task } from "@/types";
import { toast } from "sonner";

export function useTaskActions(taskId: string, boardId: string) {
  const { selectedProject, deleteTask, moveTask, editTask } = useProjects();

  // State management dipindahkan ke sini
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // State untuk form edit
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<Task["priority"]>("low");

  // Memoize data turunan untuk efisiensi
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

  // Handler untuk membuka dialog edit dan mengisi form
  const handleEditTask = () => {
    if (!derivedData?.task) return;
    setEditTitle(derivedData.task.title);
    setEditDescription(derivedData.task.description);
    setEditPriority(derivedData.task.priority);
    setIsDropdownOpen(false);
    setIsEditDialogOpen(true);
  };

  // Handler untuk menyimpan perubahan
  const handleSaveEdit = async () => {
    if (!editTitle.trim() || editTitle.length < 3 || !derivedData) return;

    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      editTask(taskId, boardId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority,
      });
      toast.success("Task updated successfully", {
        description: `"${editTitle.trim()}" has been updated in ${
          derivedData.currentBoard.name
        }.`,
      });
      setIsEditDialogOpen(false);
    } catch {
      toast.error("Failed to update task");
    } finally {
      setIsSaving(false);
    }
  };

  // Handler lainnya
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
    // Data
    ...derivedData,
    // State UI
    isEditDialogOpen,
    isDropdownOpen,
    isSaving,
    // State Form
    editTitle,
    editDescription,
    editPriority,
    // Setters
    setIsDropdownOpen,
    setIsEditDialogOpen,
    setEditTitle,
    setEditDescription,
    setEditPriority,
    // Handlers
    handleEditTask,
    handleSaveEdit,
    handleDeleteTask,
    handleMoveToPrevious,
    handleMoveToNext,
    handleMoveTask,
  };
}
