import { toast } from "sonner";

import type { Dispatch, SetStateAction } from "react";
import type { Board, Project } from "@/types";
import {
  createBoardAction,
  deleteBoardAction,
  updateBoardAction,
} from "@/app/actions/board";

type LoadData = (isBackgroundRefresh?: boolean) => void | Promise<void>;

type CreateBoardActionsArgs = {
  selectedProjectId: string | null;
  projects: Project[];
  setProjects: Dispatch<SetStateAction<Project[]>>;
  loadData: LoadData;
};

export function createBoardActions({
  selectedProjectId,
  projects,
  setProjects,
  loadData,
}: CreateBoardActionsArgs) {
  const addBoard = async (
    boardName: string,
    options?: { toast?: boolean }
  ) => {
    if (!selectedProjectId) {
      return { success: false, message: "No project selected" };
    }

    const shouldToast = options?.toast !== false;
    const result = await createBoardAction(selectedProjectId, boardName);

    if (result.success) {
      if (shouldToast) toast.success("Board berhasil dibuat");
      loadData(true);
      return { success: true };
    }

    if (shouldToast) toast.error(result.message || "Gagal membuat board");
    return { success: false, message: result.message || "Gagal membuat board" };
  };

  const deleteBoard = async (
    boardId: string,
    options?: { toast?: boolean }
  ) => {
    if (!selectedProjectId) {
      return { success: false, message: "No project selected" };
    }

    const shouldToast = options?.toast !== false;
    const currentProject = projects.find((p) => p.id === selectedProjectId);

    if (currentProject && currentProject.boards.length <= 1) {
      if (shouldToast) toast.warning("Tidak bisa menghapus board terakhir");
      return {
        success: false,
        message: "Tidak bisa menghapus board terakhir",
        variant: "warning" as const,
      };
    }

    setProjects((prev) =>
      prev.map((project) => {
        if (project.id === selectedProjectId) {
          return {
            ...project,
            boards: project.boards.filter((b) => b.id !== boardId),
          };
        }
        return project;
      })
    );

    const result = await deleteBoardAction(boardId);
    if (!result.success) {
      if (shouldToast) toast.error(result.message || "Gagal menghapus board");
      loadData(true);
      return { success: false, message: result.message || "Gagal menghapus board" };
    }

    return { success: true };
  };

  const editBoard = async (
    boardId: string,
    updates: Partial<Pick<Board, "name">>
  ) => {
    if (!selectedProjectId) return;

    setProjects((prev) =>
      prev.map((project) => {
        if (project.id === selectedProjectId) {
          return {
            ...project,
            boards: project.boards.map((b) =>
              b.id === boardId ? { ...b, ...updates } : b
            ),
          };
        }
        return project;
      })
    );

    if (updates.name) {
      await updateBoardAction(boardId, updates.name);
    }
  };

  return { addBoard, deleteBoard, editBoard };
}
