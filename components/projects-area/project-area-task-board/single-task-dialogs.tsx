import type { Board, Task } from "@/types";
import EditTaskDialog from "@/components/windows-dialogs/task-dialog/edit-task-dialog";
import DeleteTaskDialog from "@/components/windows-dialogs/task-dialog/delete-task-dialog";
import CopyTaskDialog from "@/components/windows-dialogs/task-dialog/copy-task-dialog";
import { useTaskActions } from "@/hooks/use-task-actions";

type TaskActions = ReturnType<typeof useTaskActions>;

export function SingleTaskDialogs({
  task,
  boardId,
  boards,
  taskActions,
  isDeleteOpen,
  setIsDeleteOpen,
}: {
  task: Task;
  boardId: string;
  boards: Board[];
  taskActions: TaskActions;
  isDeleteOpen: boolean;
  setIsDeleteOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  if (!taskActions.task) return null;

  return (
    <>
      <EditTaskDialog
        isOpen={taskActions.isEditDialogOpen}
        isSaving={taskActions.isSaving}
        onClose={() => taskActions.setIsEditDialogOpen(false)}
        onSave={taskActions.handleSaveEdit}
        title={taskActions.editTitle}
        description={taskActions.editDescription}
        priority={taskActions.editPriority}
        progress={taskActions.editProgress}
        startDate={taskActions.editStartDate}
        dueDate={taskActions.editDueDate}
        editLabels={taskActions.editLabels}
        editBoardId={taskActions.editBoardId}
        boards={boards}
        setTitle={taskActions.setEditTitle}
        setDescription={taskActions.setEditDescription}
        setPriority={taskActions.setEditPriority}
        setProgress={taskActions.setEditProgress}
        setStartDate={taskActions.setEditStartDate}
        setDueDate={taskActions.setEditDueDate}
        setEditLabels={taskActions.setEditLabels}
        setEditBoardId={taskActions.setEditBoardId}
        boardName={taskActions.currentBoard?.name || ""}
        editChecklist={taskActions.editChecklist}
        editCardDisplayPreference={taskActions.editCardDisplayPreference}
        setEditChecklist={taskActions.setEditChecklist}
        setEditCardDisplayPreference={taskActions.setEditCardDisplayPreference}
        editAssignees={taskActions.editAssignees}
        setEditAssignees={taskActions.setEditAssignees}
        editAttachments={taskActions.editAttachments}
        setEditAttachments={taskActions.setEditAttachments}
      />

      <DeleteTaskDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        task={task}
        boardName={taskActions.currentBoard?.name || ""}
        onDelete={taskActions.handleDeleteTask}
      />

      <CopyTaskDialog
        isOpen={taskActions.isCopyDialogOpen}
        onOpenChange={taskActions.setIsCopyDialogOpen}
        task={task}
        currentBoardId={boardId}
      />
    </>
  );
}

