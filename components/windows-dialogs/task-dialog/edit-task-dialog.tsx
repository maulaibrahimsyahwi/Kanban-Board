"use client";

import { useState } from "react";
import { useProjects } from "@/contexts/projectContext";
import LinkAttachmentDialog from "./sub-component/link-attachment-dialog";
import type { EditTaskDialogProps } from "./edit-task-dialog.types";
import { EditTaskDialogModal } from "./edit-task-dialog-modal";

export default function EditTaskDialog({
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
}: EditTaskDialogProps) {
  const { selectedProject } = useProjects();

  const members = selectedProject
    ? [selectedProject.owner, ...selectedProject.members].filter(
        (member, index, arr) =>
          arr.findIndex((item) => item.id === member.id) === index
      )
    : undefined;

  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  return (
    <>
      <EditTaskDialogModal
        isOpen={isOpen}
        isSaving={isSaving}
        onClose={onClose}
        onSave={onSave}
        title={title}
        description={description}
        priority={priority}
        progress={progress}
        startDate={startDate}
        dueDate={dueDate}
        editLabels={editLabels}
        editBoardId={editBoardId}
        boards={boards}
        setTitle={setTitle}
        setDescription={setDescription}
        setPriority={setPriority}
        setProgress={setProgress}
        setStartDate={setStartDate}
        setDueDate={setDueDate}
        setEditLabels={setEditLabels}
        setEditBoardId={setEditBoardId}
        boardName={boardName}
        editChecklist={editChecklist}
        editCardDisplayPreference={editCardDisplayPreference}
        setEditChecklist={setEditChecklist}
        setEditCardDisplayPreference={setEditCardDisplayPreference}
        editAssignees={editAssignees}
        setEditAssignees={setEditAssignees}
        editAttachments={editAttachments}
        setEditAttachments={setEditAttachments}
        members={members}
        isUploading={isUploading}
        setIsUploading={setIsUploading}
        onOpenLinkDialog={() => setIsLinkDialogOpen(true)}
      />

      <LinkAttachmentDialog
        isOpen={isLinkDialogOpen}
        onOpenChange={setIsLinkDialogOpen}
        linkUrl={linkUrl}
        setLinkUrl={setLinkUrl}
        linkText={linkText}
        setLinkText={setLinkText}
        attachments={editAttachments}
        setAttachments={setEditAttachments}
      />
    </>
  );
}
