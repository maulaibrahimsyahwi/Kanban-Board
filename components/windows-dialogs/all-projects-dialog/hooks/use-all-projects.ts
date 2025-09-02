import { useState } from "react";
import { useProjects } from "@/contexts/projectContext";
import { Project, Task } from "@/contexts/projectContext";
import { toast } from "sonner";
import { useSearchFilter } from "./use-search-filter";

interface UseAllProjectsDialogProps {
  setIsOpen: (open: boolean) => void;
}

export function useAllProjectsDialog({ setIsOpen }: UseAllProjectsDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteAllConfirmOpen, setDeleteAllConfirmOpen] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<{
    task: Task;
    boardId: string;
    boardName: string;
    projectName: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("projects");

  const { projects, selectedProject, selectProject, deleteProject, editTask } =
    useProjects();

  const { filteredProjects, filteredBoards, allBoards, allTasks } =
    useSearchFilter({ projects, searchQuery });

  const handleSelectProject = (project: Project) => {
    selectProject(project.id);
    setIsOpen(false);
    toast.success("Project selected", {
      description: `Switched to "${project.name}" project.`,
    });
  };

  const handleDeleteProject = async (projectId: string) => {
    setIsDeleting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      deleteProject(projectId);
      setDeleteProjectId(null);
      toast.success("Project deleted", {
        description: "Project has been permanently deleted.",
      });
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAllProjects = async () => {
    setIsDeleting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      projects.forEach((project) => deleteProject(project.id));
      setDeleteAllConfirmOpen(false);
      setIsOpen(false);
      toast.success("All projects deleted", {
        description: "All projects have been permanently deleted.",
      });
    } catch {
      toast.error("Failed to delete all projects");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditTask = (
    task: Task,
    updatedData: Partial<Task>,
    boardId: string
  ) => {
    editTask(task.id, boardId, updatedData);
    setSelectedTaskForEdit(null);
    toast.success("Task updated", {
      description: `"${task.title}" has been updated.`,
    });
  };

  const getTotalStats = () => {
    const totalProjects = projects.length;
    const totalTasks = allTasks.length;
    const totalBoards = allBoards.length;
    return { totalProjects, totalTasks, totalBoards };
  };

  const stats = getTotalStats();

  return {
    // States
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    deleteProjectId,
    setDeleteProjectId,
    deleteAllConfirmOpen,
    setDeleteAllConfirmOpen,
    selectedTaskForEdit,
    setSelectedTaskForEdit,
    isDeleting,

    // Data
    projects,
    selectedProject,
    filteredProjects,
    filteredBoards,
    stats,

    // Handlers
    handleSelectProject,
    handleDeleteProject,
    handleDeleteAllProjects,
    handleEditTask,
  };
}
