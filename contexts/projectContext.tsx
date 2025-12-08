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

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
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
            return prev;
          });
        }
      } catch (error) {
        console.error("Failed to load data", error);
        toast.error("Gagal memuat data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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
      const p = result.data as unknown as ProjectDTO;

      const newProjectData: Project = {
        id: p.id,
        name: p.name,
        ownerId: p.ownerId,
        icon: iconMap[iconName] || FaDiagramProject,
        createdAt: new Date(p.createdAt),
        owner: { name: "Me", email: "", image: "" },
        members: [],
        statusId: null,
        status: null,
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

      setTimeout(() => {
        window.location.reload();
      }, 1000);
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

  const addTaskToProject = async (
    taskData: Omit<Task, "id" | "createdAt">,
    boardId: string,
    projectId: string
  ) => {
    const result = await createTaskAction(boardId, taskData);

    if (result.success && result.data) {
      const t = result.data as unknown as TaskDTO;

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
        assignees: t.assignees || [],
        attachments: t.attachments || [],
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
