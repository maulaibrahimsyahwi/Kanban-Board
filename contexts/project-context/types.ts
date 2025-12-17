import type { Board, Project, ProjectStatus, Task } from "@/types";

export interface LabelDTO {
  name: string;
  color: string;
}

export interface ChecklistItemDTO {
  id: string;
  text: string;
  isDone: boolean;
}

export interface TaskDTO {
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

export interface BoardDTO {
  id: string;
  name: string;
  createdAt: Date;
  tasks: TaskDTO[];
}

export interface ProjectDTO {
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

export interface ProjectContextType {
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

