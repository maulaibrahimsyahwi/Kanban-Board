"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import TaskName from "./sub-component/task-name";
import TaskDescription from "./sub-component/task-description";
import PrioritySelector from "./sub-component/priority-selector";
import LabelSelector from "./sub-component/label-selector";
import { DatePicker } from "../../ui/date-picker";
import { TaskChecklist } from "./sub-component/task-checklist";
import ProgressSelector from "./sub-component/progress-selector";
import { Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task, UserProfile } from "@/types";
import TaskAssigneePopover, {
  SelectedAssignees,
} from "./sub-component/task-assignees";
import TaskAttachmentsMenu, {
  TaskAttachmentsList,
} from "./sub-component/task-attachments";
import type { EditTaskDialogProps } from "./edit-task-dialog.types";

const truncateBoardName = (name: string, maxLength: number = 30) => {
  return name.length <= maxLength ? name : name.slice(0, maxLength) + "...";
};

export function EditTaskDialogModal({
  isOpen,
  isSaving,
  onClose,
  onSave,
  title,
  description,
  priority,
  progress,
  startDate,
  dueDate,
  editLabels,
  editBoardId,
  boards,
  setTitle,
  setDescription,
  setPriority,
  setProgress,
  setStartDate,
  setDueDate,
  setEditLabels,
  setEditBoardId,
  boardName,
  editChecklist,
  editCardDisplayPreference,
  setEditChecklist,
  setEditCardDisplayPreference,
  editAssignees,
  setEditAssignees,
  editAttachments,
  setEditAttachments,
  members,
  isUploading,
  setIsUploading,
  onOpenLinkDialog,
}: EditTaskDialogProps & {
  members?: UserProfile[];
  isUploading: boolean;
  setIsUploading: (value: boolean) => void;
  onOpenLinkDialog: () => void;
}) {
  const handleDisplayPreferenceChange = (
    preference: "description" | "checklist"
  ) => {
    setEditCardDisplayPreference((current: Task["cardDisplayPreference"]) =>
      current === preference ? "none" : preference
    );
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onSave();
    }
  };

  const toggleAssignee = (member: UserProfile) => {
    const exists = editAssignees.find((a) => a.email === member.email);
    if (exists) {
      setEditAssignees(editAssignees.filter((a) => a.email !== member.email));
    } else {
      setEditAssignees([...editAssignees, member]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogPortal>
        <DialogContent
          className={cn(
            "max-w-lg poppins overflow-y-auto max-h-[90vh]",
            "dialog-scrollable-content"
          )}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Task
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Editing task in &quot;{truncateBoardName(boardName)}&quot; board
            </p>
          </DialogHeader>
          <div className="space-y-4 py-4 overflow-hidden">
            <TaskName value={title} onChange={setTitle} onEnter={onSave} />

            <div className="flex flex-col gap-4 mt-3 mb-2">
              <div className="flex items-center gap-3">
                <TaskAssigneePopover
                  members={members}
                  assignees={editAssignees}
                  onToggleAssignee={toggleAssignee}
                />

                <TaskAttachmentsMenu
                  attachments={editAttachments}
                  setAttachments={setEditAttachments}
                  isUploading={isUploading}
                  setIsUploading={setIsUploading}
                  onOpenLinkDialog={onOpenLinkDialog}
                />
              </div>

              <SelectedAssignees
                assignees={editAssignees}
                onToggleAssignee={toggleAssignee}
              />

              {editAttachments.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Attachments
                  </Label>
                  <TaskAttachmentsList
                    attachments={editAttachments}
                    setAttachments={setEditAttachments}
                  />
                </div>
              )}
            </div>

            <TaskDescription
              value={description}
              onChange={setDescription}
              onEnter={onSave}
              actionSlot={
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="editDisplayDesc"
                    name="editCardDisplay"
                    checked={editCardDisplayPreference === "description"}
                    onChange={() => handleDisplayPreferenceChange("description")}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <Label
                    htmlFor="editDisplayDesc"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Tampilkan pada kartu
                  </Label>
                </div>
              }
            />

            <TaskChecklist
              items={editChecklist}
              onChange={setEditChecklist}
              actionSlot={
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="editDisplayChecklist"
                    name="editCardDisplay"
                    checked={editCardDisplayPreference === "checklist"}
                    onChange={() => handleDisplayPreferenceChange("checklist")}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <Label
                    htmlFor="editDisplayChecklist"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Tampilkan pada kartu
                  </Label>
                </div>
              }
            />

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-4">
                <LabelSelector
                  selectedLabels={editLabels}
                  onLabelsChange={setEditLabels}
                />
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-board-select"
                    className="text-sm font-medium"
                  >
                    Wadah
                  </Label>
                  <select
                    id="edit-board-select"
                    value={editBoardId}
                    onChange={(e) => setEditBoardId(e.target.value)}
                    className="w-full h-11 border border-input bg-background rounded-md px-3 text-sm"
                  >
                    {boards.map((board) => (
                      <option key={board.id} value={board.id}>
                        {board.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <ProgressSelector
                  selectedProgress={progress}
                  onSelectProgress={setProgress}
                />
                <PrioritySelector
                  selectedPriority={priority}
                  onSelectPriority={setPriority}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-start-date" className="text-sm font-medium">
                  Start date
                </Label>
                <DatePicker
                  date={startDate}
                  onDateChange={setStartDate}
                  placeholder="Select date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-due-date" className="text-sm font-medium">
                  Due date
                </Label>
                <DatePicker
                  date={dueDate}
                  onDateChange={setDueDate}
                  placeholder="Select date"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isSaving || isUploading}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={onSave}
              disabled={!title.trim() || title.length < 3 || isSaving || isUploading}
              className="cursor-pointer min-w-[130px]"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
