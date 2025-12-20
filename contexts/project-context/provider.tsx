"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Message } from "ably";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import type { Project, ProjectStatus } from "@/types";
import { getProjectsAction } from "@/app/actions/project";
import { getProjectStatusesAction, setProjectStatusAction } from "@/app/actions/project-status";
import { moveTaskAction } from "@/app/actions/task";

import { createBoardActions } from "./actions/board-actions";
import { createProjectActions } from "./actions/project-actions";
import { createTaskActions } from "./actions/task-actions";
import { mapProjectsFromDto } from "./map-projects";
import type { ProjectContextType, ProjectDTO } from "./types";

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);
const realtimeEnabled = process.env.NEXT_PUBLIC_REALTIME_ENABLED === "true";

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectStatuses, setProjectStatuses] = useState<ProjectStatus[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Hindari UI "mantul" karena realtime refresh (Supabase) menarik data lama tepat setelah optimistic update.
  const lastLocalMutationAt = useRef<number>(0);
  const realtimeRefreshTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingMoveMutationsCount = useRef<number>(0);
  const needsRefreshAfterPendingMoves = useRef<boolean>(false);
  const pendingMoveQueue = useRef<
    Map<string, { inFlight: boolean; next?: { toBoardId: string; index: number } }>
  >(new Map());

  const markLocalMutation = () => {
    lastLocalMutationAt.current = Date.now();
  };

  const loadData = useCallback(async (isBackgroundRefresh = false) => {
    if (isBackgroundRefresh && pendingMoveMutationsCount.current > 0) {
      // Menahan refresh realtime sementara ada mutation move yang masih jalan,
      // supaya UI tidak "balik/ngacak" karena state DB perantara.
      needsRefreshAfterPendingMoves.current = true;
      return;
    }

    if (!isBackgroundRefresh) setIsLoading(true);

    try {
      const [projectsRes, statusesRes] = await Promise.all([
        getProjectsAction(),
        getProjectStatusesAction(),
      ]);

      if (statusesRes.success && statusesRes.data) {
        setProjectStatuses(statusesRes.data);
      }

      if (projectsRes.success && projectsRes.data) {
        const dbProjects = projectsRes.data as unknown as ProjectDTO[];
        const mappedProjects = mapProjectsFromDto(dbProjects);

        setProjects(mappedProjects);
        setSelectedProjectId((prev) => {
          if (!prev && mappedProjects.length > 0) {
            return mappedProjects[0].id;
          }
          if (prev && !mappedProjects.find((p) => p.id === prev)) {
            return mappedProjects.length > 0 ? mappedProjects[0].id : null;
          }
          return prev;
        });
      }
    } catch (error) {
      console.error("Failed to load data", error);
      if (!isBackgroundRefresh) toast.error("Gagal memuat data");
    } finally {
      if (!isBackgroundRefresh) setIsLoading(false);
    }
  }, []);

  const flushMoveQueue = useCallback(
    async (taskId: string) => {
      const entry = pendingMoveQueue.current.get(taskId);
      if (!entry) return;

      while (true) {
        const current = pendingMoveQueue.current.get(taskId);
        if (!current) return;

        const next = current.next;
        if (!next) {
          current.inFlight = false;
          pendingMoveQueue.current.set(taskId, current);
          return;
        }

        current.next = undefined;
        pendingMoveQueue.current.set(taskId, current);

        pendingMoveMutationsCount.current += 1;
        try {
          const result = await moveTaskAction(taskId, next.toBoardId, next.index);
          if (!result.success) {
            toast.error(result.message || "Gagal memindahkan task");
            // Reset queue untuk task ini agar tidak mengirim state usang setelah gagal.
            pendingMoveQueue.current.delete(taskId);
            loadData(true);
            return;
          }
        } finally {
          pendingMoveMutationsCount.current = Math.max(
            0,
            pendingMoveMutationsCount.current - 1
          );
          if (
            pendingMoveMutationsCount.current === 0 &&
            needsRefreshAfterPendingMoves.current
          ) {
            needsRefreshAfterPendingMoves.current = false;
            loadData(true);
          }
        }
      }
    },
    [loadData]
  );

  const queueMoveTaskMutation = useCallback(
    (taskId: string, toBoardId: string, index: number) => {
      const existing = pendingMoveQueue.current.get(taskId) ?? { inFlight: false };

      existing.next = { toBoardId, index };
      pendingMoveQueue.current.set(taskId, existing);

      if (existing.inFlight) return;

      existing.inFlight = true;
      pendingMoveQueue.current.set(taskId, existing);
      void flushMoveQueue(taskId);
    },
    [flushMoveQueue]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!realtimeEnabled) return;
    if (status !== "authenticated") return;
    if (!session?.user?.id) return;
    if (!selectedProjectId) return;

    const scheduleRealtimeRefresh = () => {
      const minDelayMs = 600;
      const elapsed = Date.now() - lastLocalMutationAt.current;
      const delay = elapsed < minDelayMs ? minDelayMs - elapsed : 0;

      if (realtimeRefreshTimeout.current) {
        clearTimeout(realtimeRefreshTimeout.current);
      }

      realtimeRefreshTimeout.current = setTimeout(() => {
        loadData(true);
      }, delay);
    };

    let cancelled = false;
    let realtime: { close: () => void; channels: { get: (name: string) => any } } | null =
      null;
    let channel: any = null;
    let handler: ((message: Message) => void) | null = null;

    void (async () => {
      try {
        const Ably = (await import("ably")).default;
        if (cancelled) return;

        realtime = new Ably.Realtime({
          authUrl: `/api/realtime/auth?projectId=${encodeURIComponent(selectedProjectId)}`,
          authMethod: "GET",
          closeOnUnload: true,
        });

        channel = realtime.channels.get(`project:${selectedProjectId}`);
        handler = (message: Message) => {
          const data =
            message.data && typeof message.data === "object"
              ? (message.data as { actorId?: unknown })
              : null;

          if (data?.actorId === session.user.id) return;
          scheduleRealtimeRefresh();
        };

        channel.subscribe("invalidate", handler);
      } catch (error) {
        console.warn("[realtime] Failed to initialize Ably client:", error);
      }
    })();

    return () => {
      cancelled = true;
      if (channel && handler) {
        channel.unsubscribe("invalidate", handler);
      }
      realtime?.close();
      if (realtimeRefreshTimeout.current) {
        clearTimeout(realtimeRefreshTimeout.current);
        realtimeRefreshTimeout.current = null;
      }
    };
  }, [loadData, selectedProjectId, session?.user?.id, status]);

  const refreshStatuses = async () => {
    const res = await getProjectStatusesAction();
    if (res.success && res.data) {
      setProjectStatuses(res.data);
    }
  };

  const refreshProjects = useCallback(() => {
    void loadData(true);
  }, [loadData]);

  const updateProjectStatus = async (projectId: string, statusId: string) => {
    const targetStatus = projectStatuses.find((s) => s.id === statusId);

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return { ...p, statusId, status: targetStatus || null };
        }
        return p;
      })
    );

    const result = await setProjectStatusAction(projectId, statusId);
    if (!result.success) {
      toast.error("Gagal mengupdate status project");
      loadData(true);
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || null;
  const selectProject = (projectId: string) => setSelectedProjectId(projectId);

  const { addProject, deleteProject, editProject } = createProjectActions({
    loadData,
    setProjects,
    setSelectedProjectId,
  });

  const { addBoard, deleteBoard, editBoard } = createBoardActions({
    selectedProjectId,
    projects,
    setProjects,
    loadData,
  });

  const { addTaskToProject, deleteTask, editTask, moveTask, reorderTasksInBoard } =
    createTaskActions({
      selectedProjectId,
      projects,
      selectedProject,
      setProjects,
      loadData,
      markLocalMutation,
      queueMoveTaskMutation,
    });

  const value: ProjectContextType = {
    projects,
    selectedProject,
    projectStatuses,
    isLoading,
    selectProject,
    addProject,
    addTaskToProject,
    moveTask,
    reorderTasksInBoard,
    deleteTask,
    editTask,
    deleteProject,
    editProject,
    deleteBoard,
    editBoard,
    addBoard,
    updateProjectStatus,
    refreshStatuses,
    refreshProjects,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
};
