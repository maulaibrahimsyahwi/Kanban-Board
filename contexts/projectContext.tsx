"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
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

// Types
import { Task, Board, Project } from "@/types";

// Server Actions
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

const iconMap: Record<string, IconType> = {
  FaMobileRetro,
  FaFlagCheckered,
  FaDiagramProject,
  FaLaptopCode,
  FaBullhorn,
  FaCartShopping,
};

// DTO Interfaces
interface PrismaTaskDTO {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  progress: string;
  startDate: Date | null;
  dueDate: Date | null;
  cardDisplayPreference: string;
  createdAt: Date;
  labels: { name: string; color: string }[];
  checklist: { id: string; text: string; isDone: boolean }[];
}

interface PrismaBoardDTO {
  id: string;
  name: string;
  createdAt: Date;
  tasks: PrismaTaskDTO[];
}

interface PrismaProjectDTO {
  id: string;
  name: string;
  icon: string;
  ownerId: string;
  createdAt: Date;
  boards: PrismaBoardDTO[];
}

interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  selectProject: (projectId: string) => void;
  addProject: (projectName: string, iconName?: string) => void;
  addTaskToProject: (
    taskData: Omit<Task, "id" | "createdAt">,
    boardId: string,
    projectId: string
  ) => void;
  moveTask: (taskId: string, fromBoardId: string, toBoardId: string) => void;
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
  deleteProject: (projectId: string) => void;
  editProject: (
    projectId: string,
    updates: Partial<Pick<Project, "name" | "icon">>
  ) => void;
  deleteBoard: (boardId: string) => void;
  editBoard: (boardId: string, updates: Partial<Pick<Board, "name">>) => void;
  addBoard: (boardName: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // === 1. LOAD DATA ===
  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      try {
        const result = await getProjectsAction();

        if (result.success && result.data) {
          const dbProjects = result.data as unknown as PrismaProjectDTO[];

          const mappedProjects: Project[] = dbProjects.map((p) => ({
            id: p.id,
            name: p.name,
            ownerId: p.ownerId,
            icon: iconMap[p.icon] || FaDiagramProject,
            createdAt: new Date(p.createdAt),
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
                labels: t.labels,
                checklist: t.checklist,
              })),
            })),
          }));

          setProjects(mappedProjects);

          setSelectedProjectId((prev) => {
            if (!prev && mappedProjects.length > 0) {
              return mappedProjects[0].id;
            }
            return prev;
          });
        }
      } catch (error) {
        console.error("Failed to load projects", error);
        toast.error("Gagal memuat data project");
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  const selectedProject =
    projects.find((p) => p.id === selectedProjectId) || null;

  const selectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  // === 2. PROJECT ACTIONS ===

  const addProject = async (
    projectName: string,
    iconName: string = "FaDiagramProject"
  ) => {
    const result = await createProjectAction(projectName);

    if (result.success && result.data) {
      const p = result.data as unknown as PrismaProjectDTO;
      const newProjectData: Project = {
        id: p.id,
        name: p.name,
        ownerId: p.ownerId,
        icon: iconMap[iconName] || FaDiagramProject,
        createdAt: new Date(p.createdAt),
        boards: p.boards.map((b) => ({
          id: b.id,
          name: b.name,
          createdAt: new Date(b.createdAt),
          tasks: [],
        })),
      };

      setProjects((prev) => [newProjectData, ...prev]);
      setSelectedProjectId(newProjectData.id);
      toast.success("Project berhasil dibuat!");
    } else {
      toast.error(result.message || "Gagal membuat project");
    }
  };

  const deleteProject = async (projectId: string) => {
    const prevProjects = [...projects];
    setProjects((prev) => {
      const filtered = prev.filter((p) => p.id !== projectId);
      if (selectedProjectId === projectId) {
        setSelectedProjectId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });

    const result = await deleteProjectAction(projectId);
    if (!result.success) {
      setProjects(prevProjects);
      toast.error("Gagal menghapus project");
    } else {
      toast.success("Project dihapus");
    }
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
      if (!result.success) toast.error("Gagal mengupdate project");
    }
  };

  // === 3. BOARD ACTIONS ===

  const addBoard = async (boardName: string) => {
    if (!selectedProjectId) return;

    const result = await createBoardAction(selectedProjectId, boardName);

    if (result.success && result.data) {
      const b = result.data;
      const newBoard: Board = {
        id: b.id,
        name: b.name,
        createdAt: new Date(b.createdAt),
        tasks: [],
      };

      setProjects((prev) =>
        prev.map((project) => {
          if (project.id === selectedProjectId) {
            return { ...project, boards: [...project.boards, newBoard] };
          }
          return project;
        })
      );
      toast.success("Board berhasil dibuat");
    } else {
      toast.error("Gagal membuat board");
    }
  };

  const deleteBoard = async (boardId: string) => {
    if (!selectedProjectId) return;

    const prevProjects = [...projects];
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id === selectedProjectId) {
          if (project.boards.length <= 1) {
            toast.warning("Tidak bisa menghapus board terakhir");
            return project;
          }
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
      setProjects(prevProjects);
      toast.error("Gagal menghapus board");
    }
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

  // === 4. TASK ACTIONS ===

  const addTaskToProject = async (
    taskData: Omit<Task, "id" | "createdAt">,
    boardId: string,
    projectId: string
  ) => {
    const result = await createTaskAction(boardId, taskData);

    if (result.success && result.data) {
      const t = result.data as unknown as PrismaTaskDTO;

      const newTask: Task = {
        id: t.id,
        title: t.title,
        description: t.description || "",
        priority: t.priority as Task["priority"],
        progress: t.progress as Task["progress"],
        startDate: t.startDate ? new Date(t.startDate) : null,
        dueDate: t.dueDate ? new Date(t.dueDate) : null,
        cardDisplayPreference:
          (t.cardDisplayPreference as Task["cardDisplayPreference"]) || "none",
        createdAt: new Date(t.createdAt),
        labels: t.labels,
        checklist: t.checklist,
      };

      setProjects((prev) =>
        prev.map((project) => {
          if (project.id === projectId) {
            return {
              ...project,
              boards: project.boards.map((board) => {
                if (board.id === boardId) {
                  return { ...board, tasks: [...board.tasks, newTask] };
                }
                return board;
              }),
            };
          }
          return project;
        })
      );
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
    }
  };

  const deleteTask = async (taskId: string, boardId: string) => {
    if (!selectedProjectId) return;

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
    toBoardId: string
  ) => {
    setProjects((prevProjects) => {
      const projectIndex = prevProjects.findIndex(
        (p) => p.id === selectedProjectId
      );
      if (projectIndex === -1) return prevProjects;

      const currentProject = prevProjects[projectIndex];
      const fromBoard = currentProject.boards.find((b) => b.id === fromBoardId);

      const taskToMove = fromBoard?.tasks.find((task) => task.id === taskId);
      if (!taskToMove) return prevProjects;

      const newProjects = [...prevProjects];
      const newBoards = newProjects[projectIndex].boards.map((board) => {
        if (board.id === fromBoardId) {
          return {
            ...board,
            tasks: board.tasks.filter((task) => task.id !== taskId),
          };
        }
        if (board.id === toBoardId) {
          return { ...board, tasks: [...board.tasks, taskToMove] };
        }
        return board;
      });

      newProjects[projectIndex] = { ...currentProject, boards: newBoards };
      return newProjects;
    });

    const targetBoard = selectedProject?.boards.find((b) => b.id === toBoardId);
    const newOrder = targetBoard ? targetBoard.tasks.length + 1 : 0;

    const result = await moveTaskAction(taskId, toBoardId, newOrder);
    if (!result.success) {
      toast.error("Gagal memindahkan task");
    }
  };

  const reorderTasksInBoard = async (
    boardId: string,
    sourceIndex: number,
    destinationIndex: number
  ) => {
    if (!selectedProjectId) return;

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
      await moveTaskAction(taskInBoard.id, boardId, destinationIndex);
    }
  };

  const value = {
    projects,
    selectedProject,
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
