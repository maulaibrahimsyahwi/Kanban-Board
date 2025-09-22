import { IconType } from "react-icons";

// Tipe data dasar untuk Task
export type Task = {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  createdAt: Date;
};

// Tipe data dasar untuk Board
export type Board = {
  id: string;
  name: string;
  createdAt: Date;
  tasks: Task[];
};

// Tipe data dasar untuk Project
export type Project = {
  id: string;
  name: string;
  icon: IconType;
  createdAt: Date;
  boards: Board[];
};
