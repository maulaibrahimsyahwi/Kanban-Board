export const TASK_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

export const DRAG_TYPES = {
  TASK: "task",
  BOARD: "board",
  TASK_REORDER: "task-reorder",
} as const;

export const STORAGE_KEYS = {
  PROJECTS: "kanban-projects",
  SELECTED_PROJECT: "kanban-selected-project",
  HAS_VISITED: "kanban-has-visited",
} as const;

export type TaskLabel = {
  id: string;
  name: string;
  color: string;
};

export const DEFAULT_LABELS: TaskLabel[] = [
  {
    id: "l1",
    name: "Bug",
    color: "bg-red-600 text-white",
  },
  {
    id: "l2",
    name: "Feature",
    color: "bg-blue-600 text-white",
  },
  {
    id: "l3",
    name: "Improvement",
    color: "bg-green-600 text-white",
  },
  {
    id: "l4",
    name: "Documentation",
    color: "bg-yellow-500 text-black",
  },
  {
    id: "l5",
    name: "Help Needed",
    color: "bg-purple-600 text-white",
  },
];
