import { IconType } from "react-icons";

export type ChecklistItem = {
  id: string;
  text: string;
  isDone: boolean;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "important" | "urgent";
  createdAt: Date;
  progress: "not-started" | "in-progress" | "completed";
  startDate: Date | null;
  dueDate: Date | null;
  labels: {
    name: string;
    color: string;
  }[];
  checklist: ChecklistItem[];
  cardDisplayPreference: "none" | "description" | "checklist";
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
