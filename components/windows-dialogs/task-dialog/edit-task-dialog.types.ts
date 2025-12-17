import type { Attachment, Board, Task, UserProfile } from "@/types";
import type { Dispatch, SetStateAction } from "react";

export interface EditTaskDialogProps {
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
  title: string;
  description: string;
  priority: Task["priority"];
  progress: Task["progress"];
  startDate: Date | null;
  dueDate: Date | null;
  editLabels: Task["labels"];
  editBoardId: string;
  boards: Board[];
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setPriority: (value: Task["priority"]) => void;
  setProgress: (value: Task["progress"]) => void;
  setStartDate: (date: Date | null) => void;
  setDueDate: (date: Date | null) => void;
  setEditLabels: (value: Task["labels"]) => void;
  setEditBoardId: (value: string) => void;
  boardName: string;
  editChecklist: Task["checklist"];
  editCardDisplayPreference: Task["cardDisplayPreference"];
  setEditChecklist: (items: Task["checklist"]) => void;
  setEditCardDisplayPreference: Dispatch<
    SetStateAction<Task["cardDisplayPreference"]>
  >;
  editAssignees: UserProfile[];
  setEditAssignees: (value: UserProfile[]) => void;
  editAttachments: Attachment[];
  setEditAttachments: (value: Attachment[]) => void;
}

