import type { Task, Board } from "@/types";
import { cn } from "@/lib/utils";
import { Check, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import PrioritySelector from "@/components/windows-dialogs/task-dialog/sub-component/priority-selector";
import ProgressSelector from "@/components/windows-dialogs/task-dialog/sub-component/progress-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CompactDatePicker } from "./ListViewHelpers";
import type { TaskLabel } from "@/constants";
import type { AppliedLabel } from "./editable-task-labels-utils";
import { EditableTaskLabelsDropdown } from "./editable-task-labels-dropdown";
import { EditableTaskEditLabelDialog } from "./editable-task-edit-label-dialog";

export function EditableTaskRowContent({
  task,
  boards,
  editTitle,
  setEditTitle,
  editStartDate,
  setEditStartDate,
  editDueDate,
  setEditDueDate,
  editBoardId,
  currentBoardName,
  isOverdue,
  hasChecklist,
  totalChecklist,
  completedChecklist,
  availableLabelsForDropdown,
  onSave,
  onToggleLabel,
  onRemoveLabelFromBadge,
  onOpenEditLabelDialog,
  onOpenEditDialog,
  isEditLabelDialogOpen,
  setIsEditLabelDialogOpen,
  editLabelName,
  setEditLabelName,
  editLabelColor,
  setEditLabelColor,
  onSaveLabelEdit,
}: {
  task: Omit<Task & { boardName: string; boardId: string }, "labels"> & {
    labels: AppliedLabel[];
  };
  boards: Board[];
  editTitle: string;
  setEditTitle: React.Dispatch<React.SetStateAction<string>>;
  editStartDate: Date | null;
  setEditStartDate: React.Dispatch<React.SetStateAction<Date | null>>;
  editDueDate: Date | null;
  setEditDueDate: React.Dispatch<React.SetStateAction<Date | null>>;
  editBoardId: string;
  currentBoardName: string;
  isOverdue: boolean;
  hasChecklist: boolean;
  totalChecklist: number;
  completedChecklist: number;
  availableLabelsForDropdown: TaskLabel[];
  onSave: (key: keyof Task | "boardId", value: unknown) => void;
  onToggleLabel: (label: TaskLabel) => void;
  onRemoveLabelFromBadge: (e: React.MouseEvent, labelName: string) => void;
  onOpenEditLabelDialog: (e: React.MouseEvent, label: TaskLabel) => void;
  onOpenEditDialog: () => void;
  isEditLabelDialogOpen: boolean;
  setIsEditLabelDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editLabelName: string;
  setEditLabelName: React.Dispatch<React.SetStateAction<string>>;
  editLabelColor: string;
  setEditLabelColor: React.Dispatch<React.SetStateAction<string>>;
  onSaveLabelEdit: () => void;
}) {
  return (
    <>
      <div
        className={cn(
          "grid grid-cols-[1.5fr_150px_150px_150px_120px_180px_160px_150px_80px] items-center text-sm text-foreground px-4 hover:bg-muted/50 transition-colors"
        )}
      >
        <div className="contents py-2.5">
          <div className="font-medium truncate pr-2 py-1">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => onSave("title", editTitle)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
              }}
              className={cn(
                "h-7 w-full border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 shadow-none hover:bg-muted/70 cursor-pointer text-sm",
                editTitle.trim().length < 3 &&
                  task.title.length >= 3 &&
                  "ring-2 ring-red-500"
              )}
            />
          </div>

          <div className="text-muted-foreground truncate pr-2 py-1">Task</div>

          <div className="text-muted-foreground truncate pr-2 py-1 pb-5">
            <CompactDatePicker
              date={editStartDate}
              onDateChange={(d) => {
                setEditStartDate(d);
                onSave("startDate", d);
              }}
              placeholder={"-"}
              isOverdue={false}
            />
          </div>

          <div
            className={cn(
              "truncate pr-2 py-1 pb-5",
              isOverdue && "text-red-500 font-medium"
            )}
          >
            <CompactDatePicker
              date={editDueDate}
              onDateChange={(d) => {
                setEditDueDate(d);
                onSave("dueDate", d);
              }}
              placeholder={"-"}
              isOverdue={isOverdue}
            />
          </div>

          <div className="truncate pr-2 py-1">
            <Select value={editBoardId} onValueChange={(newId) => onSave("boardId", newId)}>
              <SelectTrigger
                className="h-7 p-1 text-xs border-dashed text-muted-foreground"
                size="sm"
              >
                <SelectValue placeholder={currentBoardName} />
              </SelectTrigger>
              <SelectContent>
                {boards.map((board) => (
                  <SelectItem key={board.id} value={board.id}>
                    {board.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pr-2 py-1 ">
            <ProgressSelector
              selectedProgress={task.progress}
              onSelectProgress={(p) => onSave("progress", p)}
              size="sm"
            />
          </div>

          <div className="py-1">
            <PrioritySelector
              selectedPriority={task.priority}
              onSelectPriority={(p) => onSave("priority", p)}
              size="sm"
            />
          </div>

          <div className="py-1">
            <EditableTaskLabelsDropdown
              labels={task.labels}
              availableLabels={availableLabelsForDropdown}
              onToggleLabel={onToggleLabel}
              onRemoveLabelFromBadge={onRemoveLabelFromBadge}
              onOpenEditLabelDialog={onOpenEditLabelDialog}
            />
          </div>

          <div className="flex items-center justify-end py-1" onClick={onOpenEditDialog}>
            {hasChecklist ? (
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs h-5 px-2 cursor-pointer transition-colors hover:bg-muted/70",
                  completedChecklist === totalChecklist &&
                    "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                )}
              >
                <Check className="w-3 h-3 mr-1" />
                {completedChecklist}/{totalChecklist}
              </Badge>
            ) : task.description ? (
              <Button
                variant="ghost"
                size="icon-sm"
                className="w-8 h-8 text-muted-foreground hover:bg-muted"
              >
                <ListChecks className="w-4 h-4" />
              </Button>
            ) : (
              <div className="w-8 h-8"></div>
            )}
          </div>
        </div>
      </div>

      <EditableTaskEditLabelDialog
        open={isEditLabelDialogOpen}
        onOpenChange={setIsEditLabelDialogOpen}
        labelName={editLabelName}
        setLabelName={setEditLabelName}
        labelColor={editLabelColor}
        setLabelColor={setEditLabelColor}
        onSave={onSaveLabelEdit}
      />
    </>
  );
}
