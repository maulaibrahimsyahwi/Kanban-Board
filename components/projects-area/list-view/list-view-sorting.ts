import type { Task } from "@/types";

export type SortKey =
  | "title"
  | "startDate"
  | "dueDate"
  | "boardName"
  | "progress"
  | "priority"
  | "none";

export type SortDirection = "asc" | "desc";

export type TaskWithBoardInfo = Task & { boardName: string; boardId: string };

const priorityOrder: { [key in Task["priority"]]: number } = {
  urgent: 4,
  important: 3,
  medium: 2,
  low: 1,
};

const progressOrder: { [key in Task["progress"]]: number } = {
  "not-started": 0,
  "in-progress": 1,
  completed: 2,
};

export const createTaskComparator = (
  sortBy: SortKey,
  sortDirection: SortDirection
) => {
  return (a: TaskWithBoardInfo, b: TaskWithBoardInfo) => {
    const direction = sortDirection === "asc" ? 1 : -1;
    let valA: string | number;
    let valB: string | number;

    switch (sortBy) {
      case "title":
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
        return direction * (valA < valB ? -1 : valA > valB ? 1 : 0);
      case "startDate":
      case "dueDate":
        valA = a[sortBy] ? new Date(a[sortBy] as Date).getTime() : 0;
        valB = b[sortBy] ? new Date(b[sortBy] as Date).getTime() : 0;
        if (valA === 0 && valB !== 0) return direction * 1;
        if (valA !== 0 && valB === 0) return direction * -1;
        return direction * (valA - valB);
      case "boardName":
        valA = a.boardName.toLowerCase();
        valB = b.boardName.toLowerCase();
        return direction * (valA < valB ? -1 : valA > valB ? 1 : 0);
      case "progress":
        valA = progressOrder[a.progress];
        valB = progressOrder[b.progress];
        return direction * (valA - valB);
      case "priority": {
        const pA = a.priority as keyof typeof priorityOrder;
        const pB = b.priority as keyof typeof priorityOrder;
        valA = priorityOrder[pA] || 0;
        valB = priorityOrder[pB] || 0;
        return direction * (valA - valB);
      }
      default:
        return 0;
    }
  };
};

