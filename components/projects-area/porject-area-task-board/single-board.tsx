import { useEffect, useRef, useState } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import SingleTask from "./single-task";
import { Board } from "@/contexts/projectContext";
import { useProjects } from "@/contexts/projectContext";
import TaskDialog from "@/components/windows-dialogs/task-dialog/taskdialog";
import BoardDropDown from "@/components/board-dropdown-menu";

interface SingleBoardProps {
  board: Board;
  boardIndex: number;
  totalBoards: number;
}

export default function SingleBoard({
  board,
  boardIndex,
  totalBoards,
}: SingleBoardProps) {
  const { name: boardName, tasks, id: boardId } = board;
  const boardRef = useRef<HTMLDivElement>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const { moveTask } = useProjects();

  useEffect(() => {
    const element = boardRef.current;
    if (!element) return;

    return dropTargetForElements({
      element,
      getData: () => ({
        type: "board",
        boardId,
      }),
      canDrop: ({ source }) => {
        return source.data.type === "task" && source.data.boardId !== boardId;
      },
      getIsSticky: () => true,
      onDragEnter: ({ source }) => {
        if (source.data.type === "task" && source.data.boardId !== boardId) {
          setIsDraggedOver(true);
        }
      },
      onDragLeave: ({ source }) => {
        if (source.data.type === "task" && source.data.boardId !== boardId) {
          setIsDraggedOver(false);
        }
      },
      onDrop: ({ source }) => {
        setIsDraggedOver(false);
        if (source.data.type === "task") {
          const taskId = source.data.taskId as string;
          const sourceBoardId = source.data.boardId as string;

          if (sourceBoardId !== boardId) {
            moveTask(taskId, sourceBoardId, boardId);
          }
        }
      },
    });
  }, [boardId, moveTask]);

  return (
    <div
      ref={boardRef}
      className={`w-full h-full border rounded-xl md:rounded-2xl bg-card flex flex-col transition-all duration-200 ${
        isDraggedOver
          ? "border-primary/50 bg-primary/5 shadow-lg"
          : "border-border"
      } p-3 md:p-4 single-board`}
    >
      {/* Board Header - Fixed height, tidak akan shrink */}
      <div className="bg-muted/50 flex justify-between p-2 sm:p-3 md:p-4 rounded-lg items-center mb-3 md:mb-4 flex-shrink-0 min-h-[3rem] sm:min-h-[3.5rem] group">
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 min-w-0 flex-1">
          <span className="font-medium text-xs sm:text-sm md:text-base text-foreground truncate leading-tight">
            {boardName}
          </span>
          <div className="bg-primary text-primary-foreground rounded-full w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex items-center justify-center text-[10px] sm:text-xs md:text-sm font-bold flex-shrink-0">
            <span>{tasks.length}</span>
          </div>
        </div>
        <div className="flex-shrink-0 ml-1 sm:ml-2">
          <BoardDropDown
            board={board}
            boardIndex={boardIndex}
            totalBoards={totalBoards}
          />
        </div>
      </div>

      {/* Tasks Container - Flexible, akan grow/shrink dan scroll di mobile */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 sm:space-y-3 pr-1 task-scroll-container">
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center h-24 sm:h-32 md:h-40 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">
                {isDraggedOver ? "Drop task here" : "No tasks yet"}
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <SingleTask key={task.id} task={task} boardId={boardId} />
            ))
          )}
        </div>

        {/* Add Task Button - Fixed height, tidak akan shrink */}
        <div className="mt-2 sm:mt-3 flex-shrink-0">
          <TaskDialog
            boardId={boardId}
            trigger={
              <div className="border-2 border-dashed border-border rounded-lg p-2 sm:p-3 md:p-4 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer">
                <span className="text-muted-foreground text-xs sm:text-sm">
                  + Add new task
                </span>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
