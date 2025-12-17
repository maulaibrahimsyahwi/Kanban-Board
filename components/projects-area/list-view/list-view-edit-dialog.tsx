import type { Board } from "@/types";
import EditTaskDialog from "@/components/windows-dialogs/task-dialog/edit-task-dialog";
import { useListViewTaskEditor } from "./use-list-view-task-editor";

type EditorState = ReturnType<typeof useListViewTaskEditor>;

export function ListViewEditDialog({
  editor,
  boards,
}: {
  editor: EditorState;
  boards: Board[];
}) {
  if (!editor.taskToEditInfo) return null;

  return (
    <EditTaskDialog
      isOpen={true}
      isSaving={editor.isSaving}
      onClose={editor.closeEditor}
      onSave={editor.save}
      title={editor.editTitle}
      description={editor.editDescription}
      priority={editor.editPriority}
      progress={editor.editProgress}
      startDate={editor.editStartDate}
      dueDate={editor.editDueDate}
      editLabels={editor.editLabels}
      editBoardId={editor.editBoardId}
      editChecklist={editor.editChecklist}
      editCardDisplayPreference={editor.editCardDisplayPreference}
      setTitle={editor.setEditTitle}
      setDescription={editor.setEditDescription}
      setPriority={editor.setEditPriority}
      setProgress={editor.setEditProgress}
      setStartDate={editor.setEditStartDate}
      setDueDate={editor.setEditDueDate}
      setEditLabels={editor.setEditLabels}
      setEditBoardId={editor.setEditBoardId}
      setEditChecklist={editor.setEditChecklist}
      setEditCardDisplayPreference={editor.setEditCardDisplayPreference}
      boards={boards}
      boardName={editor.taskToEditInfo.boardName}
      editAssignees={editor.editAssignees}
      setEditAssignees={editor.setEditAssignees}
      editAttachments={editor.editAttachments}
      setEditAttachments={editor.setEditAttachments}
    />
  );
}

