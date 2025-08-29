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
import { v4 as uuidv4 } from "uuid";

// --- TIPE DATA UTAMA ---
export type Task = {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  createdAt: Date;
};

export type Board = {
  id: string;
  name: string;
  createdAt: Date;
  tasks: Task[];
};

export type Project = {
  id: string;
  name: string;
  icon: IconType;
  createdAt: Date;
  boards: Board[];
};

// --- MAPPING ICON NAMES ---
const iconMap: Record<string, IconType> = {
  FaMobileRetro,
  FaFlagCheckered,
  FaDiagramProject,
  FaLaptopCode,
  FaBullhorn,
  FaCartShopping,
};

// --- LOCAL STORAGE KEYS ---
const STORAGE_KEYS = {
  PROJECTS: "kanban-projects",
  SELECTED_PROJECT: "kanban-selected-project",
  HAS_VISITED: "kanban-has-visited",
};

// Helper function untuk cek apakah localStorage tersedia
const isLocalStorageAvailable = (): boolean => {
  try {
    if (typeof window === "undefined") return false;
    const test = "__localStorage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// FUNGSI HELPER UNTUK SERIALIZE/DESERIALIZE
const serializeProjects = (projects: Project[]): string => {
  try {
    const serializedProjects = projects.map((project) => ({
      ...project,
      iconName:
        Object.keys(iconMap).find((key) => iconMap[key] === project.icon) ||
        "FaDiagramProject",
      createdAt: project.createdAt.toISOString(),
      boards: project.boards.map((board) => ({
        ...board,
        createdAt: board.createdAt.toISOString(),
        tasks: board.tasks.map((task) => ({
          ...task,
          createdAt: task.createdAt.toISOString(),
        })),
      })),
    }));
    return JSON.stringify(serializedProjects);
  } catch (error) {
    console.error("Error serializing projects:", error);
    return "[]";
  }
};

const deserializeProjects = (data: string): Project[] => {
  try {
    const parsedData = JSON.parse(data);
    return parsedData.map((project: any) => ({
      ...project,
      icon: iconMap[project.iconName] || FaDiagramProject,
      createdAt: new Date(project.createdAt),
      boards: project.boards.map((board: any) => ({
        ...board,
        createdAt: new Date(board.createdAt),
        tasks: board.tasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
        })),
      })),
    }));
  } catch (error) {
    console.error("Error deserializing projects:", error);
    return [];
  }
};

const loadProjectsFromStorage = (): Project[] => {
  if (!isLocalStorageAvailable()) return [];
  try {
    const storedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (storedProjects && storedProjects !== "undefined") {
      return deserializeProjects(storedProjects);
    }
  } catch (error) {
    console.error("Error loading projects from localStorage:", error);
  }
  return [];
};

const saveProjectsToStorage = (projects: Project[]): void => {
  if (!isLocalStorageAvailable()) return;
  try {
    const serialized = serializeProjects(projects);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, serialized);
  } catch (error) {
    console.error("Error saving projects to localStorage:", error);
  }
};

const saveSelectedProjectToStorage = (projectId: string | null): void => {
  if (!isLocalStorageAvailable()) return;
  try {
    if (projectId) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_PROJECT, projectId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_PROJECT);
    }
  } catch (error) {
    console.error("Error saving selected project to localStorage:", error);
  }
};

const loadSelectedProjectFromStorage = (): string | null => {
  if (!isLocalStorageAvailable()) return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SELECTED_PROJECT);
    return stored && stored !== "undefined" ? stored : null;
  } catch (error) {
    console.error("Error loading selected project from localStorage:", error);
    return null;
  }
};

const isFirstTimeUser = (): boolean => {
  if (!isLocalStorageAvailable()) return true;
  try {
    const hasVisited = localStorage.getItem(STORAGE_KEYS.HAS_VISITED);
    return hasVisited === null || hasVisited === "undefined";
  } catch (error) {
    return true;
  }
};

const markUserAsVisited = (): void => {
  if (!isLocalStorageAvailable()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.HAS_VISITED, "true");
  } catch (error) {
    console.warn("Cannot save visited status to localStorage");
  }
};

// --- TIPE CONTEXT ---
interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  isFirstTime: boolean;
  isLoading: boolean;
  selectProject: (projectId: string) => void;
  addProject: (projectName: string, iconName?: string) => void;
  addTaskToProject: (
    taskData: Omit<Task, "id" | "createdAt">,
    boardId: string
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

// --- PROVIDER COMPONENT ---
export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [isFirstTime, setIsFirstTime] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load data saat component mount dengan better error handling
  useEffect(() => {
    const initializeData = () => {
      try {
        const firstTime = isFirstTimeUser();
        setIsFirstTime(firstTime);

        if (!firstTime) {
          const storedProjects = loadProjectsFromStorage();
          const storedSelectedProject = loadSelectedProjectFromStorage();

          setProjects(storedProjects);

          if (
            storedSelectedProject &&
            storedProjects.find((p) => p.id === storedSelectedProject)
          ) {
            setSelectedProjectId(storedSelectedProject);
          } else if (storedProjects.length > 0) {
            setSelectedProjectId(storedProjects[0].id);
            saveSelectedProjectToStorage(storedProjects[0].id);
          }
        } else {
          markUserAsVisited();
        }
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(initializeData, 100);
    return () => clearTimeout(timer);
  }, []);

  // Save projects ke localStorage dengan throttling
  useEffect(() => {
    if (!isLoading && !isFirstTime && projects.length > 0) {
      const timeoutId = setTimeout(() => {
        saveProjectsToStorage(projects);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [projects, isLoading, isFirstTime]);

  // Save selected project ke localStorage
  useEffect(() => {
    if (!isLoading && selectedProjectId) {
      saveSelectedProjectToStorage(selectedProjectId);
    }
  }, [selectedProjectId, isLoading]);

  const selectedProject =
    projects.find((p) => p.id === selectedProjectId) || null;

  const selectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  const addProject = (
    projectName: string,
    iconName: string = "FaDiagramProject"
  ) => {
    const newProject: Project = {
      id: uuidv4(),
      name: projectName,
      icon: iconMap[iconName] || FaDiagramProject,
      createdAt: new Date(),
      boards: [
        {
          id: uuidv4(),
          name: "To Do",
          createdAt: new Date(),
          tasks: [],
        },
        {
          id: uuidv4(),
          name: "In Progress",
          createdAt: new Date(),
          tasks: [],
        },
        {
          id: uuidv4(),
          name: "Done",
          createdAt: new Date(),
          tasks: [],
        },
      ],
    };

    setProjects((prev) => [...prev, newProject]);
    setSelectedProjectId(newProject.id);

    if (isFirstTime) {
      setIsFirstTime(false);
    }
  };

  const deleteProject = (projectId: string) => {
    setProjects((prev) => {
      const filtered = prev.filter((p) => p.id !== projectId);
      if (selectedProjectId === projectId) {
        if (filtered.length > 0) {
          setSelectedProjectId(filtered[0].id);
        } else {
          setSelectedProjectId(null);
        }
      }
      return filtered;
    });
  };

  const editProject = (
    projectId: string,
    updates: Partial<Pick<Project, "name" | "icon">>
  ) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId ? { ...project, ...updates } : project
      )
    );
  };

  const addTaskToProject = (
    taskData: Omit<Task, "id" | "createdAt">,
    boardId: string
  ) => {
    if (!selectedProjectId) return;
    const newTask: Task = { ...taskData, id: uuidv4(), createdAt: new Date() };
    setProjects((prevProjects) =>
      prevProjects.map((project) => {
        if (project.id === selectedProjectId) {
          const updatedBoards = project.boards.map((board) => {
            if (board.id === boardId) {
              return { ...board, tasks: [...board.tasks, newTask] };
            }
            return board;
          });
          return { ...project, boards: updatedBoards };
        }
        return project;
      })
    );
  };

  // Logika moveTask yang disederhanakan dan lebih efisien
  const moveTask = (taskId: string, fromBoardId: string, toBoardId: string) => {
    setProjects((prevProjects) => {
      const projectIndex = prevProjects.findIndex(
        (p) => p.id === selectedProjectId
      );
      if (projectIndex === -1) {
        console.error("Selected project not found.");
        return prevProjects;
      }

      const currentProject = prevProjects[projectIndex];
      const fromBoard = currentProject.boards.find((b) => b.id === fromBoardId);
      const toBoard = currentProject.boards.find((b) => b.id === toBoardId);

      if (!fromBoard || !toBoard) {
        console.error("Source or target board not found.");
        return prevProjects;
      }

      const taskToMove = fromBoard.tasks.find((task) => task.id === taskId);
      if (!taskToMove) {
        console.error("Task not found in source board.");
        return prevProjects;
      }

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
  };

  const reorderTasksInBoard = (
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

              // Remove task from source position
              const [movedTask] = tasks.splice(sourceIndex, 1);

              // Insert task at destination position
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
  };

  const deleteTask = (taskId: string, boardId: string) => {
    if (!selectedProjectId) return;
    setProjects((prevProjects) =>
      prevProjects.map((project) => {
        if (project.id === selectedProjectId) {
          const updatedBoards = project.boards.map((board) => {
            if (board.id === boardId) {
              return {
                ...board,
                tasks: board.tasks.filter((task) => task.id !== taskId),
              };
            }
            return board;
          });
          return { ...project, boards: updatedBoards };
        }
        return project;
      })
    );
  };

  const editTask = (
    taskId: string,
    boardId: string,
    updatedTask: Partial<Task>
  ) => {
    if (!selectedProjectId) return;
    setProjects((prevProjects) =>
      prevProjects.map((project) => {
        if (project.id === selectedProjectId) {
          const updatedBoards = project.boards.map((board) => {
            if (board.id === boardId) {
              return {
                ...board,
                tasks: board.tasks.map((task) =>
                  task.id === taskId ? { ...task, ...updatedTask } : task
                ),
              };
            }
            return board;
          });
          return { ...project, boards: updatedBoards };
        }
        return project;
      })
    );
  };

  const deleteBoard = (boardId: string) => {
    if (!selectedProjectId) return;
    setProjects((prevProjects) =>
      prevProjects.map((project) => {
        if (project.id === selectedProjectId) {
          if (project.boards.length <= 1) {
            console.warn("Cannot delete the last board");
            return project;
          }
          const updatedBoards = project.boards.filter(
            (board) => board.id !== boardId
          );
          return { ...project, boards: updatedBoards };
        }
        return project;
      })
    );
  };

  const editBoard = (
    boardId: string,
    updates: Partial<Pick<Board, "name">>
  ) => {
    if (!selectedProjectId) return;
    setProjects((prevProjects) =>
      prevProjects.map((project) => {
        if (project.id === selectedProjectId) {
          const updatedBoards = project.boards.map((board) =>
            board.id === boardId ? { ...board, ...updates } : board
          );
          return { ...project, boards: updatedBoards };
        }
        return project;
      })
    );
  };
  const addBoard = (boardName: string) => {
    if (!selectedProjectId) return;
    const newBoard: Board = {
      id: uuidv4(),
      name: boardName,
      createdAt: new Date(),
      tasks: [],
    };
    setProjects((prevProjects) =>
      prevProjects.map((project) => {
        if (project.id === selectedProjectId) {
          return {
            ...project,
            boards: [...project.boards, newBoard],
          };
        }
        return project;
      })
    );
  };

  const value = {
    projects,
    selectedProject,
    isFirstTime,
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

// --- CUSTOM HOOK ---
export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
};
