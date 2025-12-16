"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
  useCallback,
} from "react";
import {
  FaMobileRetro,
  FaFlagCheckered,
  FaDiagramProject,
  FaLaptopCode,
  FaBullhorn,
  FaCartShopping,
} from "react-icons/fa6";
import { IconType } from "react-icons";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

import { Task, Board, Project, ProjectStatus } from "@/types";

import {
  createProjectAction,
  getProjectsAction,
  deleteProjectAction,
  updateProjectAction,
} from "@/app/actions/project";
import {
  createBoardAction,
  deleteBoardAction,
  updateBoardAction,
} from "@/app/actions/board";
import {
  createTaskAction,
  updateTaskAction,
  deleteTaskAction,
  moveTaskAction,
} from "@/app/actions/task";
import {
  getProjectStatusesAction,
  setProjectStatusAction,
} from "@/app/actions/project-status";

const iconMap: Record<string, IconType> = {
  FaMobileRetro,
  FaFlagCheckered,
  FaDiagramProject,
  FaLaptopCode,
  FaBullhorn,
  FaCartShopping,
};

interface LabelDTO {
  name: string;
  color: string;
}

interface ChecklistItemDTO {
  id: string;
  text: string;
  isDone: boolean;
}

interface TaskDTO {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  progress: string;
  startDate: Date | null;
  dueDate: Date | null;
  cardDisplayPreference: string;
  createdAt: Date;
  updatedAt: Date;
  order: number;
  boardId: string;
  labels: LabelDTO[];
  checklist: ChecklistItemDTO[];
  assignees: {
    name: string | null;
    email: string | null;
    image: string | null;
  }[];
  attachments: { id: string; name: string; url: string; type: string }[];
}

interface BoardDTO {
  id: string;
  name: string;
  createdAt: Date;
  tasks: TaskDTO[];
}

interface ProjectDTO {
  id: string;
  name: string;
  ownerId: string;
  icon: string;
  createdAt: Date;
  owner: { name: string | null; email: string | null; image: string | null };
  members: {
    name: string | null;
    email: string | null;
    image: string | null;
  }[];
  statusId: string | null;
  status: { id: string; name: string; color: string; isSystem: boolean } | null;
  boards: BoardDTO[];
}

interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  projectStatuses: ProjectStatus[];
  isLoading: boolean;
  selectProject: (projectId: string) => void;
  addProject: (projectName: string, iconName?: string) => void;
  addTaskToProject: (
    taskData: Partial<Task>,
    boardId: string,
    projectId: string
  ) => void;
  moveTask: (
    taskId: string,
    fromBoardId: string,
    toBoardId: string,
    newIndex?: number
  ) => void;
  reorderTasksInBoard: (
    boardId: string,
    sourceIndex: number,
    destinationIndex: number
  ) => void;
  deleteTask: (taskId: string, boardId: string) => void;
  editTask: (
    taskId: string,
    boardId: string,
    updatedTask: Partial<Task>
  ) => void;
  deleteProject: (
    projectId: string,
    options?: { toast?: boolean }
  ) => Promise<{ success: boolean; message?: string }>;
  editProject: (
    projectId: string,
    updates: Partial<Pick<Project, "name" | "icon">>
  ) => void;
  deleteBoard: (
    boardId: string,
    options?: { toast?: boolean }
  ) => Promise<{ success: boolean; message?: string; variant?: "warning" }>;
  editBoard: (boardId: string, updates: Partial<Pick<Board, "name">>) => void;
  addBoard: (
    boardName: string,
    options?: { toast?: boolean }
  ) => Promise<{ success: boolean; message?: string }>;
  updateProjectStatus: (projectId: string, statusId: string) => void;
  refreshStatuses: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectStatuses, setProjectStatuses] = useState<ProjectStatus[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Hindari UI "mantul" karena realtime refresh (Supabase) menarik data lama tepat setelah optimistic update.
  const lastLocalMutationAt = useRef<number>(0);
  const realtimeRefreshTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const pendingMoveMutationsCount = useRef<number>(0);
  const needsRefreshAfterPendingMoves = useRef<boolean>(false);
  const pendingMoveQueue = useRef<
    Map<
      string,
      { inFlight: boolean; next?: { toBoardId: string; index: number } }
    >
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

        const mappedProjects: Project[] = dbProjects.map((p) => ({
          id: p.id,
          name: p.name,
          ownerId: p.ownerId,
          icon: iconMap[p.icon] || FaDiagramProject,
          createdAt: new Date(p.createdAt),
          owner: p.owner,
          members: p.members,
          statusId: p.statusId,
          status: p.status,
          boards: p.boards.map((b) => ({
            id: b.id,
            name: b.name,
            createdAt: new Date(b.createdAt),
            tasks: b.tasks.map((t) => ({
              id: t.id,
              title: t.title,
              description: t.description || "",
              priority: t.priority as Task["priority"],
              progress: t.progress as Task["progress"],
              startDate: t.startDate ? new Date(t.startDate) : null,
              dueDate: t.dueDate ? new Date(t.dueDate) : null,
              cardDisplayPreference:
                (t.cardDisplayPreference as Task["cardDisplayPreference"]) ||
                "none",
              createdAt: new Date(t.createdAt),
              updatedAt: new Date(t.updatedAt),
              order: t.order,
              boardId: t.boardId,
              labels: t.labels,
              checklist: t.checklist,
              assignees: t.assignees || [],
              attachments: t.attachments || [],
            })),
          })),
        }));

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

      // eslint-disable-next-line no-constant-condition
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
      const existing = pendingMoveQueue.current.get(taskId) ?? {
        inFlight: false,
      };

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

    const channel = supabase
      .channel("project_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Task" },
        () => {
          scheduleRealtimeRefresh();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Board" },
        () => {
          scheduleRealtimeRefresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (realtimeRefreshTimeout.current) {
        clearTimeout(realtimeRefreshTimeout.current);
        realtimeRefreshTimeout.current = null;
      }
    };
  }, [loadData]);

  const refreshStatuses = async () => {
    const res = await getProjectStatusesAction();
    if (res.success && res.data) {
      setProjectStatuses(res.data);
    }
  };

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

  const selectedProject =
    projects.find((p) => p.id === selectedProjectId) || null;

  const selectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  const addProject = async (
    projectName: string,
    iconName: string = "FaDiagramProject"
  ) => {
    const result = await createProjectAction(projectName);

    if (result.success && result.data) {
      loadData(true);
      toast.success("Project berhasil dibuat!");

      const newProj = result.data as any;
      if (newProj?.id) setSelectedProjectId(newProj.id);
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
      return { success: false, message: result.message || "Gagal menghapus project" };
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

  const addTaskToProject = async (
    taskData: Partial<Task>,
    boardId: string,
    projectId: string
  ) => {
    const result = await createTaskAction(boardId, taskData);

    if (result.success && result.data) {
      loadData(true);
    } else {
      toast.error("Gagal membuat task");
    }
  };

  const editTask = async (
    taskId: string,
    boardId: string,
    updatedTask: Partial<Task>
  ) => {
    if (!selectedProjectId) return;

    setProjects((prev) =>
      prev.map((project) => {
        if (project.id === selectedProjectId) {
          return {
            ...project,
            boards: project.boards.map((board) => {
              if (board.id === boardId) {
                return {
                  ...board,
                  tasks: board.tasks.map((t) =>
                    t.id === taskId ? { ...t, ...updatedTask } : t
                  ),
                };
              }
              return board;
            }),
          };
        }
        return project;
      })
    );

    const result = await updateTaskAction(taskId, updatedTask);
    if (!result.success) {
      toast.error("Gagal menyimpan perubahan task");
      loadData(true);
    }
  };

  const deleteTask = async (taskId: string, boardId: string) => {
    if (!selectedProjectId) return;

    markLocalMutation();
    const prevProjects = [...projects];
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id === selectedProjectId) {
          return {
            ...project,
            boards: project.boards.map((board) => {
              if (board.id === boardId) {
                return {
                  ...board,
                  tasks: board.tasks.filter((t) => t.id !== taskId),
                };
              }
              return board;
            }),
          };
        }
        return project;
      })
    );

    const result = await deleteTaskAction(taskId);
    if (!result.success) {
      setProjects(prevProjects);
      toast.error("Gagal menghapus task");
    }
  };

  const moveTask = async (
    taskId: string,
    fromBoardId: string,
    toBoardId: string,
    newIndex?: number
  ) => {
    if (!selectedProjectId) return;

    markLocalMutation();
    let resolvedIndex =
      typeof newIndex === "number" && Number.isFinite(newIndex)
        ? Math.trunc(newIndex)
        : undefined;
    let didOptimisticMove = false;

    setProjects((prevProjects) => {
      const projectIndex = prevProjects.findIndex(
        (p) => p.id === selectedProjectId
      );
      if (projectIndex === -1) return prevProjects;

      const currentProject = prevProjects[projectIndex];
      const fromBoard = currentProject.boards.find((b) => b.id === fromBoardId);
      const toBoard = currentProject.boards.find((b) => b.id === toBoardId);
      if (!fromBoard || !toBoard) return prevProjects;

      const fromTaskIndex = fromBoard.tasks.findIndex((t) => t.id === taskId);
      if (fromTaskIndex === -1) return prevProjects;

      const taskToMove = fromBoard.tasks[fromTaskIndex];

      if (!taskToMove) return prevProjects;

      const newProjects = [...prevProjects];
      const newBoards = currentProject.boards.map((board) => {
        if (fromBoardId === toBoardId && board.id === fromBoardId) {
          const tasks = [...board.tasks];
          tasks.splice(fromTaskIndex, 1);

          if (resolvedIndex === undefined) resolvedIndex = fromTaskIndex;
          const clampedIndex = Math.max(
            0,
            Math.min(resolvedIndex, tasks.length)
          );
          resolvedIndex = clampedIndex;

          tasks.splice(clampedIndex, 0, { ...taskToMove, boardId: toBoardId });
          return { ...board, tasks };
        }

        if (board.id === fromBoardId) {
          return {
            ...board,
            tasks: board.tasks.filter((task) => task.id !== taskId),
          };
        }
        if (board.id === toBoardId) {
          const newTasks = [...board.tasks];

          if (resolvedIndex === undefined) resolvedIndex = newTasks.length;
          const clampedIndex = Math.max(
            0,
            Math.min(resolvedIndex, newTasks.length)
          );
          resolvedIndex = clampedIndex;

          newTasks.splice(clampedIndex, 0, {
            ...taskToMove,
            boardId: toBoardId,
          });
          return { ...board, tasks: newTasks };
        }
        return board;
      });

      newProjects[projectIndex] = { ...currentProject, boards: newBoards };
      didOptimisticMove = true;
      return newProjects;
    });

    if (!didOptimisticMove) return;
    queueMoveTaskMutation(taskId, toBoardId, resolvedIndex ?? 0);
  };

  const reorderTasksInBoard = async (
    boardId: string,
    sourceIndex: number,
    destinationIndex: number
  ) => {
    if (!selectedProjectId) return;

    markLocalMutation();
    setProjects((prevProjects) => {
      return prevProjects.map((project) => {
        if (project.id === selectedProjectId) {
          const updatedBoards = project.boards.map((board) => {
            if (board.id === boardId) {
              const tasks = [...board.tasks];
              const [movedTask] = tasks.splice(sourceIndex, 1);
              tasks.splice(destinationIndex, 0, movedTask);
              return { ...board, tasks };
            }
            return board;
          });
          return { ...project, boards: updatedBoards };
        }
        return project;
      });
    });

    const taskInBoard = selectedProject?.boards.find((b) => b.id === boardId)
      ?.tasks[sourceIndex];

    if (taskInBoard) {
      queueMoveTaskMutation(taskInBoard.id, boardId, destinationIndex);
    }
  };

  const value = {
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
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
};
