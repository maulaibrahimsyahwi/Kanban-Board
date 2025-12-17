import { toast } from "sonner";

import type { Dispatch, SetStateAction } from "react";
import type { Project } from "@/types";
import {
  createProjectAction,
  deleteProjectAction,
  updateProjectAction,
} from "@/app/actions/project";

type LoadData = (isBackgroundRefresh?: boolean) => void | Promise<void>;

type CreateProjectActionsArgs = {
  loadData: LoadData;
  setProjects: Dispatch<SetStateAction<Project[]>>;
  setSelectedProjectId: Dispatch<SetStateAction<string | null>>;
};

export function createProjectActions({
  loadData,
  setProjects,
  setSelectedProjectId,
}: CreateProjectActionsArgs) {
  const addProject = async (
    projectName: string,
    iconName: string = "FaDiagramProject"
  ) => {
    const result = await createProjectAction(projectName, iconName);

    if (result.success && result.data) {
      loadData(true);
      toast.success("Project berhasil dibuat!");

      const maybeProjectId =
        typeof (result.data as unknown as { id?: unknown })?.id === "string"
          ? (result.data as unknown as { id: string }).id
          : null;
      if (maybeProjectId) setSelectedProjectId(maybeProjectId);
    } else {
      toast.error(result.message || "Gagal membuat project");
    }
  };

  const deleteProject = async (
    projectId: string,
    options?: { toast?: boolean }
  ) => {
    const shouldToast = options?.toast !== false;

    setProjects((prev) => {
      const filtered = prev.filter((p) => p.id !== projectId);
      setSelectedProjectId((prevSelected) =>
        prevSelected === projectId ? (filtered[0]?.id ?? null) : prevSelected
      );
      return filtered;
    });

    const result = await deleteProjectAction(projectId);
    if (!result.success) {
      if (shouldToast) toast.error(result.message || "Gagal menghapus project");
      loadData(true);
      return {
        success: false,
        message: result.message || "Gagal menghapus project",
      };
    }

    if (shouldToast) toast.success("Project dihapus");
    return { success: true };
  };

  const editProject = async (
    projectId: string,
    updates: Partial<Pick<Project, "name" | "icon">>
  ) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId ? { ...project, ...updates } : project
      )
    );

    if (updates.name) {
      const result = await updateProjectAction(projectId, {
        name: updates.name,
      });
      if (!result.success) {
        toast.error("Gagal mengupdate project");
        loadData(true);
      }
    }
  };

  return { addProject, deleteProject, editProject };
}
