// Prioritas Tugas
export const TASK_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

// Tipe Drag-and-Drop
export const DRAG_TYPES = {
  TASK: "task",
  BOARD: "board",
  TASK_REORDER: "task-reorder",
} as const;

// Kunci Local Storage
export const STORAGE_KEYS = {
  PROJECTS: "kanban-projects",
  SELECTED_PROJECT: "kanban-selected-project",
  HAS_VISITED: "kanban-has-visited",
} as const;
