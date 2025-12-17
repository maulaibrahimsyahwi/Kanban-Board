import { toast } from "sonner";

import type { Dispatch, SetStateAction } from "react";
import type { Project, Task } from "@/types";
import {
  createTaskAction,
  deleteTaskAction,
  updateTaskAction,
} from "@/app/actions/task";

type LoadData = (isBackgroundRefresh?: boolean) => void | Promise<void>;

type CreateTaskActionsArgs = {
  selectedProjectId: string | null;
  projects: Project[];
  selectedProject: Project | null;
  setProjects: Dispatch<SetStateAction<Project[]>>;
  loadData: LoadData;
  markLocalMutation: () => void;
  queueMoveTaskMutation: (taskId: string, toBoardId: string, index: number) => void;
};

export function createTaskActions({
  selectedProjectId,
  projects,
  selectedProject,
  setProjects,
  loadData,
  markLocalMutation,
  queueMoveTaskMutation,
}: CreateTaskActionsArgs) {
  const addTaskToProject = async (
    taskData: Partial<Task>,
    boardId: string,
    _projectId: string
  ) => {
    const result = await createTaskAction(boardId, taskData);

    if (result.success && result.data) {
      loadData(true);
    } else {
      toast.error("Gagal membuat task");
    }
  };

  const editTask = async (
    taskId: string,
    boardId: string,
    updatedTask: Partial<Task>
  ) => {
    if (!selectedProjectId) return;

    setProjects((prev) =>
      prev.map((project) => {
        if (project.id === selectedProjectId) {
          return {
            ...project,
            boards: project.boards.map((board) => {
              if (board.id === boardId) {
                return {
                  ...board,
                  tasks: board.tasks.map((t) =>
                    t.id === taskId ? { ...t, ...updatedTask } : t
                  ),
                };
              }
              return board;
            }),
          };
        }
        return project;
      })
    );

    const result = await updateTaskAction(taskId, updatedTask);
    if (!result.success) {
      toast.error("Gagal menyimpan perubahan task");
      loadData(true);
    }
  };

  const deleteTask = async (taskId: string, boardId: string) => {
    if (!selectedProjectId) return;

    markLocalMutation();
    const prevProjects = [...projects];
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id === selectedProjectId) {
          return {
            ...project,
            boards: project.boards.map((board) => {
              if (board.id === boardId) {
                return {
                  ...board,
                  tasks: board.tasks.filter((t) => t.id !== taskId),
                };
              }
              return board;
            }),
          };
        }
        return project;
      })
    );

    const result = await deleteTaskAction(taskId);
    if (!result.success) {
      setProjects(prevProjects);
      toast.error("Gagal menghapus task");
    }
  };

  const moveTask = async (
    taskId: string,
    fromBoardId: string,
    toBoardId: string,
    newIndex?: number
  ) => {
    if (!selectedProjectId) return;

    markLocalMutation();
    let resolvedIndex =
      typeof newIndex === "number" && Number.isFinite(newIndex)
        ? Math.trunc(newIndex)
        : undefined;
    let didOptimisticMove = false;

    setProjects((prevProjects) => {
      const projectIndex = prevProjects.findIndex((p) => p.id === selectedProjectId);
      if (projectIndex === -1) return prevProjects;

      const currentProject = prevProjects[projectIndex];
      const fromBoard = currentProject.boards.find((b) => b.id === fromBoardId);
      const toBoard = currentProject.boards.find((b) => b.id === toBoardId);
      if (!fromBoard || !toBoard) return prevProjects;

      const fromTaskIndex = fromBoard.tasks.findIndex((t) => t.id === taskId);
      if (fromTaskIndex === -1) return prevProjects;

      const taskToMove = fromBoard.tasks[fromTaskIndex];

      if (!taskToMove) return prevProjects;

      const newProjects = [...prevProjects];
      const newBoards = currentProject.boards.map((board) => {
        if (fromBoardId === toBoardId && board.id === fromBoardId) {
          const tasks = [...board.tasks];
          tasks.splice(fromTaskIndex, 1);

          if (resolvedIndex === undefined) resolvedIndex = fromTaskIndex;
          const clampedIndex = Math.max(0, Math.min(resolvedIndex, tasks.length));
          resolvedIndex = clampedIndex;

          tasks.splice(clampedIndex, 0, { ...taskToMove, boardId: toBoardId });
          return { ...board, tasks };
        }

        if (board.id === fromBoardId) {
          return {
            ...board,
            tasks: board.tasks.filter((task) => task.id !== taskId),
          };
        }
        if (board.id === toBoardId) {
          const newTasks = [...board.tasks];

          if (resolvedIndex === undefined) resolvedIndex = newTasks.length;
          const clampedIndex = Math.max(0, Math.min(resolvedIndex, newTasks.length));
          resolvedIndex = clampedIndex;

          newTasks.splice(clampedIndex, 0, { ...taskToMove, boardId: toBoardId });
          return { ...board, tasks: newTasks };
        }
        return board;
      });

      newProjects[projectIndex] = { ...currentProject, boards: newBoards };
      didOptimisticMove = true;
      return newProjects;
    });

    if (!didOptimisticMove) return;
    queueMoveTaskMutation(taskId, toBoardId, resolvedIndex ?? 0);
  };

  const reorderTasksInBoard = async (
    boardId: string,
    sourceIndex: number,
    destinationIndex: number
  ) => {
    if (!selectedProjectId) return;

    markLocalMutation();
    setProjects((prevProjects) => {
      return prevProjects.map((project) => {
        if (project.id === selectedProjectId) {
          const updatedBoards = project.boards.map((board) => {
            if (board.id === boardId) {
              const tasks = [...board.tasks];
              const [movedTask] = tasks.splice(sourceIndex, 1);
              tasks.splice(destinationIndex, 0, movedTask);
              return { ...board, tasks };
            }
            return board;
          });
          return { ...project, boards: updatedBoards };
        }
        return project;
      });
    });

    const taskInBoard = selectedProject?.boards.find((b) => b.id === boardId)
      ?.tasks[sourceIndex];

    if (taskInBoard) {
      queueMoveTaskMutation(taskInBoard.id, boardId, destinationIndex);
    }
  };

  return {
    addTaskToProject,
    editTask,
    deleteTask,
    moveTask,
    reorderTasksInBoard,
  };
}
