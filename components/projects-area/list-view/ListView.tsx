"use client";

import { useProjects } from "@/contexts/projectContext";
import { Task, Board } from "@/types";
import { useMemo, useState } from "react";
import { EditableTaskRow } from "./EditableTaskRow";
import { NewTaskRow } from "./NewTaskRow";
import { SortableHeader } from "./sortable-header";
import {
  createTaskComparator,
  SortDirection,
  SortKey,
  TaskWithBoardInfo,
} from "./list-view-sorting";
import { useListViewTaskEditor } from "./use-list-view-task-editor";
import { ListViewEditDialog } from "./list-view-edit-dialog";

interface ListViewProps {
  filteredBoards: Board[];
}

export default function ListView({ filteredBoards }: ListViewProps) {
  const { selectedProject, editTask, moveTask } = useProjects();
  const [tasksUpdated, setTasksUpdated] = useState(0);

  const [sortBy, setSortBy] = useState<SortKey>("none");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const editor = useListViewTaskEditor({
    boards: selectedProject?.boards,
    editTask,
    moveTask,
    onUpdated: () => setTasksUpdated((prev) => prev + 1),
  });

  const sortTasks = useMemo(
    () => createTaskComparator(sortBy, sortDirection),
    [sortBy, sortDirection]
  );

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDirection("asc");
    }
  };

  const tasksWithBoardInfo = useMemo(() => {
    void tasksUpdated;
    const allTasks = filteredBoards.flatMap((board: Board) =>
      board.tasks.map((task: Task) => ({
        ...task,
        boardName: board.name,
        boardId: board.id,
      }))
    );

    if (sortBy !== "none") {
      return [...allTasks].sort(sortTasks);
    }
    return allTasks;
  }, [filteredBoards, tasksUpdated, sortBy, sortTasks]);

  if (!selectedProject) return null;

  return (
    <>
      <div className="h-full w-full overflow-auto">
        <div className="min-w-[1500px] bg-card border border-border rounded-xl flex flex-col h-full">
          <div className="grid grid-cols-[1.5fr_150px_150px_150px_120px_180px_160px_150px_80px] text-sm font-semibold text-muted-foreground border-b border-border/50 py-3 px-4 z-10 flex-shrink-0 bg-card">
            <SortableHeader
              label="Nama Tugas"
              sortKey="title"
              currentSortKey={sortBy}
              currentDirection={sortDirection}
              onClick={handleSort}
            />
            <div className="text-muted-foreground/80">Tugas</div>
            <SortableHeader
              label="Tanggal mulai"
              sortKey="startDate"
              currentSortKey={sortBy}
              currentDirection={sortDirection}
              onClick={handleSort}
            />
            <SortableHeader
              label="Tenggat Waktu"
              sortKey="dueDate"
              currentSortKey={sortBy}
              currentDirection={sortDirection}
              onClick={handleSort}
            />
            <SortableHeader
              label="Wadah"
              sortKey="boardName"
              currentSortKey={sortBy}
              currentDirection={sortDirection}
              onClick={handleSort}
            />
            <SortableHeader
              label="Kemajuan"
              sortKey="progress"
              currentSortKey={sortBy}
              currentDirection={sortDirection}
              onClick={handleSort}
            />
            <SortableHeader
              label="Prioritas"
              sortKey="priority"
              currentSortKey={sortBy}
              currentDirection={sortDirection}
              onClick={handleSort}
            />
            <div className="text-muted-foreground/80">Label</div>
            <div className="text-right text-muted-foreground/80">
              Lihat sekilas
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-border/50">
              {tasksWithBoardInfo.map(
                (task: TaskWithBoardInfo) => (
                  <EditableTaskRow
                    key={task.id}
                    task={task}
                    boardId={task.boardId}
                    boards={selectedProject.boards}
                    onUpdate={() => setTasksUpdated((prev) => prev + 1)}
                    onOpenEditDialog={editor.openEditor}
                  />
                )
              )}
            </div>

            <NewTaskRow
              boards={selectedProject.boards}
              onTaskAdded={() => setTasksUpdated((prev) => prev + 1)}
            />
          </div>
        </div>
      </div>

      <ListViewEditDialog editor={editor} boards={selectedProject.boards} />
    </>
  );
}
