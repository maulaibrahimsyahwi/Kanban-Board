import { IconType } from "react-icons";

export type ChecklistItem = {
  id: string;
  text: string;
  isDone: boolean;
};

export type Attachment = {
  id: string;
  name: string;
  url: string;
  type: string;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "important" | "urgent";
  createdAt: Date;
  updatedAt: Date;
  progress: "not-started" | "in-progress" | "completed";
  statusId?: string | null;
  status?: ProjectStatus | null;
  startDate: Date | null;
  dueDate: Date | null;
  order: number;
  boardId: string;
  labels: {
    name: string;
    color: string;
  }[];
  checklist: ChecklistItem[];
  cardDisplayPreference: "none" | "description" | "checklist";
  assignees: UserProfile[];
  attachments: Attachment[];
};

export type Board = {
  id: string;
  name: string;
  createdAt: Date;
  tasks: Task[];
};

export type UserProfile = {
  name: string | null;
  email: string | null;
  image: string | null;
};

export type ProjectStatus = {
  id: string;
  name: string;
  color: string;
  isSystem: boolean;
};

export type Project = {
  id: string;
  name: string;
  ownerId: string;
  icon: IconType;
  createdAt: Date;
  boards: Board[];
  owner: UserProfile;
  members: UserProfile[];
  statusId?: string | null;
  status?: ProjectStatus | null;
};

export type DueDateFilter =
  | "overdue"
  | "today"
  | "tomorrow"
  | "this-week"
  | "next-week"
  | "upcoming"
  | "no-date";

export type PriorityFilter = Task["priority"];

export type ProgressFilter = Task["progress"];

export type ProjectAreaView =
  | "boards"
  | "calendar"
  | "chart"
  | "list"
  | "people";

export type NotificationSettingsState = {
  endDateTrigger: string;
  endDateEmail: boolean;
  endDatePush: boolean;
  deadlineTrigger: string;
  deadlineEmail: boolean;
  deadlinePush: boolean;
  startDateTrigger: string;
  startDateEmail: boolean;
  startDatePush: boolean;
  mentionsEmail: boolean;
  mentionsPush: boolean;
  assignedEmail: boolean;
  assignedPush: boolean;
  commentsEmail: boolean;
  commentsPush: boolean;
  attachmentsEmail: boolean;
  attachmentsPush: boolean;
  playSound: boolean;
  marketingEmails: boolean;
};
