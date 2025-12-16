import { useReducer, useMemo } from "react";
import { useProjects } from "@/contexts/projectContext";
import { Project, Task } from "@/types";
import { toast } from "sonner";
import { useSearchFilter } from "./use-search-filter";

interface DialogState {
  searchQuery: string;
  activeTab: "projects" | "boards";
  deleteProjectId: string | null;
  deleteAllConfirmOpen: boolean;
  selectedTaskForEdit: {
    task: Task;
    boardId: string;
    boardName: string;
    projectName: string;
  } | null;
  isDeleting: boolean;
}

const initialState: DialogState = {
  searchQuery: "",
  activeTab: "projects",
  deleteProjectId: null,
  deleteAllConfirmOpen: false,
  selectedTaskForEdit: null,
  isDeleting: false,
};

type DialogAction =
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_ACTIVE_TAB"; payload: "projects" | "boards" }
  | { type: "OPEN_DELETE_PROJECT_CONFIRM"; payload: string }
  | { type: "CLOSE_DELETE_PROJECT_CONFIRM" }
  | { type: "OPEN_DELETE_ALL_CONFIRM" }
  | { type: "CLOSE_DELETE_ALL_CONFIRM" }
  | { type: "SET_TASK_FOR_EDIT"; payload: DialogState["selectedTaskForEdit"] }
  | { type: "SET_IS_DELETING"; payload: boolean };

function dialogReducer(state: DialogState, action: DialogAction): DialogState {
  switch (action.type) {
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload };
    case "OPEN_DELETE_PROJECT_CONFIRM":
      return { ...state, deleteProjectId: action.payload };
    case "CLOSE_DELETE_PROJECT_CONFIRM":
      return { ...state, deleteProjectId: null };
    case "OPEN_DELETE_ALL_CONFIRM":
      return { ...state, deleteAllConfirmOpen: true };
    case "CLOSE_DELETE_ALL_CONFIRM":
      return { ...state, deleteAllConfirmOpen: false };
    case "SET_TASK_FOR_EDIT":
      return { ...state, selectedTaskForEdit: action.payload };
    case "SET_IS_DELETING":
      return { ...state, isDeleting: action.payload };
    default:
      return state;
  }
}

interface UseAllProjectsDialogProps {
  setIsOpen: (open: boolean) => void;
}

export function useAllProjectsDialog({ setIsOpen }: UseAllProjectsDialogProps) {
  const [state, dispatch] = useReducer(dialogReducer, initialState);

  const { projects, selectedProject, selectProject, deleteProject, editTask } =
    useProjects();

  const { filteredProjects, filteredBoards, allBoards, allTasks } =
    useSearchFilter({ projects, searchQuery: state.searchQuery });

  const handleSelectProject = (project: Project) => {
    selectProject(project.id);
    setIsOpen(false);
    toast.success("Project selected", {
      description: `Switched to "${project.name}" project.`,
    });
  };

  const handleDeleteProject = async (projectId: string) => {
    dispatch({ type: "SET_IS_DELETING", payload: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const result = await deleteProject(projectId, { toast: false });
      if (result.success) {
        dispatch({ type: "CLOSE_DELETE_PROJECT_CONFIRM" });
        toast.success("Project deleted", {
          description: "Project has been permanently deleted.",
        });
      } else {
        toast.error("Failed to delete project", {
          description: result.message,
        });
      }
    } catch (error) {
      toast.error("Failed to delete project", {
        description: (error as Error).message,
      });
    } finally {
      dispatch({ type: "SET_IS_DELETING", payload: false });
    }
  };

  const handleDeleteAllProjects = async () => {
    dispatch({ type: "SET_IS_DELETING", payload: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const projectIds = projects.map((project) => project.id);
      const results = [];
      for (const projectId of projectIds) {
        // hapus 1 per 1 agar update state lebih stabil
        results.push(await deleteProject(projectId, { toast: false }));
      }

      const failedCount = results.filter((r) => !r.success).length;
      if (failedCount === 0) {
        dispatch({ type: "CLOSE_DELETE_ALL_CONFIRM" });
        setIsOpen(false);
        toast.success("All projects deleted", {
          description: "All projects have been permanently deleted.",
        });
      } else {
        toast.error("Failed to delete all projects", {
          description: `${failedCount} project(s) failed to delete.`,
        });
      }
    } catch (error) {
      toast.error("Failed to delete all projects", {
        description: (error as Error).message,
      });
    } finally {
      dispatch({ type: "SET_IS_DELETING", payload: false });
    }
  };

  const handleEditTask = (
    task: Task,
    updatedData: Partial<Task>,
    boardId: string
  ) => {
    editTask(task.id, boardId, updatedData);
    dispatch({ type: "SET_TASK_FOR_EDIT", payload: null });
    toast.success("Task updated", {
      description: `"${task.title}" has been updated.`,
    });
  };

  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const totalTasks = allTasks.length;
    const totalBoards = allBoards.length;
    return { totalProjects, totalTasks, totalBoards };
  }, [projects, allTasks, allBoards]);

  return {
    searchQuery: state.searchQuery,
    activeTab: state.activeTab,
    deleteProjectId: state.deleteProjectId,
    deleteAllConfirmOpen: state.deleteAllConfirmOpen,
    selectedTaskForEdit: state.selectedTaskForEdit,
    isDeleting: state.isDeleting,

    setSearchQuery: (payload: string) =>
      dispatch({ type: "SET_SEARCH_QUERY", payload }),
    setActiveTab: (payload: "projects" | "boards") =>
      dispatch({ type: "SET_ACTIVE_TAB", payload }),

    setDeleteProjectId: (payload: string | null) => {
      if (payload) {
        dispatch({ type: "OPEN_DELETE_PROJECT_CONFIRM", payload });
      } else {
        dispatch({ type: "CLOSE_DELETE_PROJECT_CONFIRM" });
      }
    },

    setDeleteAllConfirmOpen: (isOpen: boolean) =>
      dispatch({
        type: isOpen ? "OPEN_DELETE_ALL_CONFIRM" : "CLOSE_DELETE_ALL_CONFIRM",
      }),
    setSelectedTaskForEdit: (payload: DialogState["selectedTaskForEdit"]) =>
      dispatch({ type: "SET_TASK_FOR_EDIT", payload }),

    projects,
    selectedProject,
    filteredProjects,
    filteredBoards,
    stats,
    handleSelectProject,
    handleDeleteProject,
    handleDeleteAllProjects,
    handleEditTask,
  };
}
