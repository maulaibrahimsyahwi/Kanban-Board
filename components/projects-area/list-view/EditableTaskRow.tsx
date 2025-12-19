"use client";

import * as React from "react";
import { useProjects } from "@/contexts/projectContext";
import { Task, Board } from "@/types";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import type { TaskLabel } from "@/constants";
import {
  AppliedLabel,
  buildAvailableLabels,
  mapTaskLabelsWithIds,
} from "./editable-task-labels-utils";
import { EditableTaskRowContent } from "./editable-task-row-content";

interface EditableTaskRowProps {
  task: Task & { boardName: string; boardId: string };
  boardId: string;
  boards: Board[];
  onUpdate: () => void;
  onOpenEditDialog: (task: Task, boardId: string, boardName: string) => void;
}

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
  >(() =>
    buildAvailableLabels({
      selectedProject,
      initialTaskLabels: initialTask.labels,
    })
  );

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
    const initialLabelsWithId = mapTaskLabelsWithIds({
      taskLabels: initialTask.labels,
      availableLabels: localAvailableLabels,
    });

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
      toast.success("Task moved", {
        description: `Task moved to ${
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

      toast.success("Task updated", {
        description: `Field \"${key}\" has been updated.`,
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
    toast.success("Label updated", {
      description: `Label \"${editLabelName}\" has been updated.`,
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
  const isCompletedTask = initialTask.progress === "done";
  const currentBoardName =
    boards.find((b) => b.id === editBoardId)?.name || initialTask.boardName;
  const isOverdue = !!(
    initialTask.dueDate &&
    new Date(initialTask.dueDate) < new Date() &&
    !isCompletedTask
  );

  return (
    <EditableTaskRowContent
      task={task}
      boards={boards}
      editTitle={editTitle}
      setEditTitle={setEditTitle}
      editStartDate={editStartDate}
      setEditStartDate={setEditStartDate}
      editDueDate={editDueDate}
      setEditDueDate={setEditDueDate}
      editBoardId={editBoardId}
      currentBoardName={currentBoardName}
      isOverdue={isOverdue}
      hasChecklist={hasChecklist}
      totalChecklist={totalChecklist}
      completedChecklist={completedChecklist}
      availableLabelsForDropdown={availableLabelsForDropdown}
      onSave={handleSave}
      onToggleLabel={handleToggleLabel}
      onRemoveLabelFromBadge={handleRemoveLabelFromBadge}
      onOpenEditLabelDialog={handleOpenEditLabelDialog}
      onOpenEditDialog={() =>
        onOpenEditDialog(initialTask, initialBoardId, currentBoardName)
      }
      isEditLabelDialogOpen={isEditLabelDialogOpen}
      setIsEditLabelDialogOpen={setIsEditLabelDialogOpen}
      editLabelName={editLabelName}
      setEditLabelName={setEditLabelName}
      editLabelColor={editLabelColor}
      setEditLabelColor={setEditLabelColor}
      onSaveLabelEdit={handleSaveLabelEdit}
    />
  );
};
