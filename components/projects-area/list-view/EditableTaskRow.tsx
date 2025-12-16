"use client";

import * as React from "react";
import { useProjects } from "@/contexts/projectContext";
import { Task, Board } from "@/types";
import { cn } from "@/lib/utils";
import { Check, ListChecks, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import PrioritySelector from "@/components/windows-dialogs/task-dialog/sub-component/priority-selector";
import ProgressSelector from "@/components/windows-dialogs/task-dialog/sub-component/progress-selector";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CompactDatePicker } from "./ListViewHelpers";
import { DEFAULT_LABELS, TaskLabel } from "@/constants";
import { IoCheckmark } from "react-icons/io5";

const COLOR_PALETTE: { name: string; class: string }[] = [
  { name: "Pink", class: "bg-pink-600 text-white" },
  { name: "Merah", class: "bg-red-600 text-white" },
  { name: "Perunggu", class: "bg-orange-600 text-white" },
  { name: "Kuning", class: "bg-yellow-500 text-black" },
  { name: "Lemon", class: "bg-lime-500 text-black" },
  { name: "Hijau", class: "bg-green-600 text-white" },
  { name: "Biru Laut", class: "bg-cyan-600 text-white" },
  { name: "Biru", class: "bg-blue-600 text-white" },
  { name: "Ungu", class: "bg-purple-600 text-white" },
  { name: "Abu-abu", class: "bg-gray-500 text-white" },
];

interface EditableTaskRowProps {
  task: Task & { boardName: string; boardId: string };
  boardId: string;
  boards: Board[];
  onUpdate: () => void;
  onOpenEditDialog: (task: Task, boardId: string, boardName: string) => void;
}

type AppliedLabel = TaskLabel & { id: string };

export const EditableTaskRow: React.FC<EditableTaskRowProps> = ({
  task: initialTask,
  boardId: initialBoardId,
  boards,
  onUpdate,
  onOpenEditDialog,
}) => {
  const { editTask, moveTask, selectedProject } = useProjects();

  const [localAvailableLabels, setLocalAvailableLabels] = useState<
    AppliedLabel[]
  >(() => {
    const labelMap = new Map<string, AppliedLabel>(
      DEFAULT_LABELS.map((label) => [label.id, label as AppliedLabel])
    );

    if (selectedProject) {
      selectedProject.boards.forEach((board) => {
        board.tasks.forEach((task) => {
          task.labels.forEach((label) => {
            const defaultMatch = DEFAULT_LABELS.find(
              (d) => d.name === label.name
            );

            let id = defaultMatch?.id;

            if (!id) {
              const editedMatch = Array.from(labelMap.values()).find(
                (l) => l.name === label.name
              );
              id = editedMatch?.id || label.name;
            }

            const currentLabelInMap = labelMap.get(id);
            if (currentLabelInMap && currentLabelInMap.name !== label.name) {
              labelMap.set(id, {
                id: id,
                name: label.name,
                color: label.color,
              });
            }
          });
        });
      });
    }

    initialTask.labels.forEach((appliedLabel) => {
      const defaultMatch = DEFAULT_LABELS.find(
        (d) => d.name === appliedLabel.name
      );
      const id = defaultMatch?.id || appliedLabel.name;
      const appliedWithId: AppliedLabel = {
        id: id,
        name: appliedLabel.name,
        color: appliedLabel.color,
      };
      if (labelMap.has(appliedWithId.id)) {
        labelMap.set(appliedWithId.id, appliedWithId);
      }
    });

    return Array.from(labelMap.values());
  });

  const [task, setTask] = useState(
    initialTask as Omit<typeof initialTask, "labels"> & {
      labels: AppliedLabel[];
    }
  );

  const [editTitle, setEditTitle] = useState(initialTask.title);
  const [editStartDate, setEditStartDate] = useState<Date | null>(
    initialTask.startDate
  );
  const [editDueDate, setEditDueDate] = useState<Date | null>(
    initialTask.dueDate
  );
  const [editBoardId, setEditBoardId] = useState(initialBoardId);

  const [isEditLabelDialogOpen, setIsEditLabelDialogOpen] = useState(false);
  const [currentLabelToEdit, setCurrentLabelToEdit] =
    useState<TaskLabel | null>(null);
  const [editLabelName, setEditLabelName] = useState("");
  const [editLabelColor, setEditLabelColor] = useState("");

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const initialLabelsWithId = initialTask.labels.map((label) => {
      const stateLabel = localAvailableLabels.find(
        (l) => l.name === label.name
      );
      const id = stateLabel?.id || label.name;
      return {
        id: id,
        name: label.name,
        color: label.color,
      };
    }) as AppliedLabel[];

    setTask({ ...initialTask, labels: initialLabelsWithId });
    setEditTitle(initialTask.title);
    setEditStartDate(initialTask.startDate);
    setEditDueDate(initialTask.dueDate);
    setEditBoardId(initialBoardId);
  }, [initialTask, initialBoardId, localAvailableLabels]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSave = (key: keyof Task | "boardId", value: unknown) => {
    if (!selectedProject) return;
    const oldBoardId = initialBoardId;

    const updates: Partial<Task> = {};
    let newBoardId = editBoardId;
    if (key === "title") {
      updates.title = (value as string).trim() || initialTask.title;
    } else if (key === "startDate") {
      updates.startDate = value as Date | null;
    } else if (key === "dueDate") {
      updates.dueDate = value as Date | null;
    } else if (key === "progress") {
      updates.progress = value as Task["progress"];
    } else if (key === "priority") {
      updates.priority = value as Task["priority"];
    } else if (key === "boardId") {
      newBoardId = value as string;
    } else if (key === "labels") {
      updates.labels = (value as AppliedLabel[]).map((l: AppliedLabel) => ({
        name: l.name,
        color: l.color,
      }));
    }

    const isMoving = newBoardId !== oldBoardId;
    if (isMoving) {
      moveTask(initialTask.id, oldBoardId, newBoardId);
      toast.success("Tugas dipindahkan", {
        description: `Tugas dipindahkan ke ${
          boards.find((b) => b.id === newBoardId)?.name
        }.`,
      });
      onUpdate();
      return;
    }

    if (Object.keys(updates).length > 0) {
      editTask(initialTask.id, oldBoardId, updates);

      setTask((prev) => {
        let newLabels = prev.labels;
        if (key === "labels") {
          newLabels = value as AppliedLabel[];
        }
        return {
          ...prev,
          ...updates,
          labels: [...newLabels],
        } as Omit<typeof initialTask, "labels"> & { labels: AppliedLabel[] };
      });

      toast.success("Tugas diperbarui", {
        description: `Kolom ${key} telah diperbarui.`,
      });
    }
  };

  const handleToggleLabel = (labelToToggle: TaskLabel) => {
    const isSelected = task.labels.some((l) => l.id === labelToToggle.id);
    let newLabels: AppliedLabel[];

    if (isSelected) {
      newLabels = task.labels.filter((l) => l.id !== labelToToggle.id);
    } else {
      newLabels = [
        ...task.labels,
        {
          id: labelToToggle.id,
          name: labelToToggle.name,
          color: labelToToggle.color,
        },
      ];
    }

    handleSave("labels", newLabels);
  };

  const handleRemoveLabelFromBadge = (
    e: React.MouseEvent,
    labelName: string
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const newLabels = task.labels.filter((l) => l.name !== labelName);
    handleSave("labels", newLabels);
  };

  const handleOpenEditLabelDialog = (e: React.MouseEvent, label: TaskLabel) => {
    e.stopPropagation();
    e.preventDefault();

    setCurrentLabelToEdit(label);
    setEditLabelName(label.name);
    setEditLabelColor(label.color);

    setIsEditLabelDialogOpen(true);
  };

  const handleSaveLabelEdit = () => {
    if (!currentLabelToEdit) return;

    const newEditedLabel: AppliedLabel = {
      id: currentLabelToEdit.id,
      name: editLabelName,
      color: editLabelColor,
    };

    setLocalAvailableLabels((prev) =>
      prev.map((l) => (l.id === newEditedLabel.id ? newEditedLabel : l))
    );

    const isAppliedOnCurrentTask = task.labels.some(
      (l) => l.id === newEditedLabel.id
    );

    if (isAppliedOnCurrentTask) {
      const updatedLabelsInTask = task.labels.map((label) =>
        label.id === newEditedLabel.id ? newEditedLabel : label
      );
      handleSave("labels", updatedLabelsInTask);
    }

    setIsEditLabelDialogOpen(false);
    setCurrentLabelToEdit(null);
    toast.success("Label diperbarui", {
      description: `Label ${editLabelName} telah diperbarui.`,
    });
  };

  const appliedLabelIds = useMemo(
    () => new Set(task.labels.map((l) => l.id)),
    [task.labels]
  );

  const availableLabelsForDropdown = useMemo(
    () =>
      localAvailableLabels.filter((label) => !appliedLabelIds.has(label.id)),
    [localAvailableLabels, appliedLabelIds]
  );

  const totalChecklist = initialTask.checklist?.length || 0;
  const completedChecklist =
    initialTask.checklist?.filter((c) => c.isDone).length || 0;
  const hasChecklist = totalChecklist > 0;
  const isCompletedTask = initialTask.progress === "completed";
  const currentBoardName =
    boards.find((b) => b.id === editBoardId)?.name || initialTask.boardName;
  const isOverdue = !!(
    initialTask.dueDate &&
    new Date(initialTask.dueDate) < new Date() &&
    !isCompletedTask
  );

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
              onBlur={() => handleSave("title", editTitle)}
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

          <div className="text-muted-foreground truncate pr-2 py-1">Tugas</div>

          <div className="text-muted-foreground truncate pr-2 py-1 pb-5">
            <CompactDatePicker
              date={editStartDate}
              onDateChange={(d) => {
                setEditStartDate(d);
                handleSave("startDate", d);
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
                handleSave("dueDate", d);
              }}
              placeholder={"-"}
              isOverdue={isOverdue}
            />
          </div>

          <div className="truncate pr-2 py-1">
            <Select
              value={editBoardId}
              onValueChange={(newId) => handleSave("boardId", newId)}
            >
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
              onSelectProgress={(p) => handleSave("progress", p)}
              size="sm"
            />
          </div>

          <div className="py-1">
            <PrioritySelector
              selectedPriority={task.priority}
              onSelectPriority={(p) => handleSave("priority", p)}
              size="sm"
            />
          </div>

          {/* LABEL SELECTOR DROP DOWN */}
          <div className="py-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex flex-wrap gap-1 cursor-pointer hover:underline py-0.5 w-full h-full min-h-[30px] items-center">
                  {task.labels &&
                    task.labels.slice(0, 1).map((label) => (
                      <Badge
                        key={label.name}
                        className={cn(
                          "text-xs px-2 py-0.5 font-medium",
                          label.color
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {label.name}
                        <X
                          className="w-3 h-3 ml-1"
                          onClick={(e) =>
                            handleRemoveLabelFromBadge(e, label.name)
                          }
                        />
                      </Badge>
                    ))}
                  {task.labels && task.labels.length > 1 && (
                    <span className="text-xs text-muted-foreground">
                      +{task.labels.length - 1}
                    </span>
                  )}
                  {!task.labels || task.labels.length === 0 ? (
                    <span className="text-muted-foreground/70 italic text-xs hover:underline">
                      Tambahkan label
                    </span>
                  ) : null}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="min-w-[200px] poppins"
                align="start"
              >
                {/* BAGIAN 1: LABEL YANG SUDAH TERPILIH (Applied Labels) */}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b mb-1">
                  Label Terpilih
                </div>
                {task.labels.map((label) => (
                  <DropdownMenuItem
                    key={label.id}
                    className={cn(
                      "flex justify-between items-center cursor-pointer bg-accent/50 group"
                    )}
                    onSelect={(e) => e.preventDefault()}
                    onClick={() => handleToggleLabel(label)}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "w-3 h-3 rounded-full",
                          label.color.split(" ")[0]
                        )}
                      />
                      <span className="text-sm">{label.name}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <IoCheckmark className="w-4 h-4 text-primary" />
                    </div>
                  </DropdownMenuItem>
                ))}

                {/* BAGIAN 2: LABEL YANG BELUM TERPILIH (Available Labels) */}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1">
                  Pilih Label
                </div>
                {availableLabelsForDropdown.map((label) => {
                  const key = label.id;
                  return (
                    <DropdownMenuItem
                      key={key}
                      className={
                        "flex justify-between items-center cursor-pointer group"
                      }
                      onSelect={(e) => e.preventDefault()}
                      onClick={() => handleToggleLabel(label)}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "w-3 h-3 rounded-full",
                            label.color.split(" ")[0]
                          )}
                        />
                        <span className="text-sm">{label.name}</span>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="w-5 h-5 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100"
                        onClick={(e) => handleOpenEditLabelDialog(e, label)}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div
            className="flex items-center justify-end py-1"
            onClick={() =>
              onOpenEditDialog(initialTask, initialBoardId, currentBoardName)
            }
          >
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

      {/* Edit Label Dialog Component */}
      <Dialog
        open={isEditLabelDialogOpen}
        onOpenChange={setIsEditLabelDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5" /> Edit Label
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="label-name">Nama Label</Label>
              <Input
                id="label-name"
                value={editLabelName}
                onChange={(e) => setEditLabelName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="space-y-2">
              <Label>Warna</Label>
              <div className="grid grid-cols-5 gap-2">
                {COLOR_PALETTE.map((color) => (
                  <Button
                    key={color.name}
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-12 w-full border-2",
                      editLabelColor === color.class
                        ? "border-primary ring-2 ring-primary"
                        : "border-border"
                    )}
                    onClick={() => setEditLabelColor(color.class)}
                  >
                    <div
                      className={cn("w-6 h-6 rounded-full", color.class)}
                    ></div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditLabelDialogOpen(false)}
            >
              Batal
            </Button>
            <Button type="button" onClick={handleSaveLabelEdit}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
