import { useEffect, useRef, useState, memo } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import SingleTask from "./single-task";
import { Board } from "@/types";
import { useProjects } from "@/contexts/projectContext";
import TaskDialog from "@/components/windows-dialogs/task-dialog/taskdialog";
import BoardDropDown from "@/components/board-dropdown-menu";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface SingleBoardProps {
  board: Board;
  boardIndex: number;
  totalBoards: number;
}

const SingleBoard = ({ board, boardIndex, totalBoards }: SingleBoardProps) => {
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
        return source.data.type === "task";
      },
      getIsSticky: () => true,
      onDragEnter: ({ source }) => {
        if (source.data.type === "task") {
          setIsDraggedOver(true);
        }
      },
      onDragLeave: ({ source }) => {
        if (source.data.type === "task") {
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
      {/* Board Header */}
      <div className="bg-muted/50 flex justify-between p-2 sm:p-3 md:p-4 rounded-lg items-center mb-3 md:mb-4 flex-shrink-0 min-h-[3rem] sm:min-h-[3.5rem] group ">
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

      {/* Tasks Container */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 sm:space-y-3 pr-1 task-scroll-container">
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center h-8 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">
                {isDraggedOver ? "Drop task here" : "No tasks yet"}
              </p>
            </div>
          ) : (
            tasks.map((task, index) => (
              <SingleTask
                key={task.id}
                task={task}
                boardId={boardId}
                taskIndex={index}
                totalTasks={tasks.length}
              />
            ))
          )}

          {/* Add Task Button (Telah Dipindahkan ke Sini) */}
          <div className="mt-2 sm:mt-3 flex-shrink-0">
            <TaskDialog
              boardId={boardId}
              trigger={
                <Card className="shadow-sm border-border bg-card/50 hover:bg-muted/80 transition-colors cursor-pointer opacity-80 hover:opacity-100">
                  <div className="flex items-center justify-center gap-2 p-3 text-center">
                    <Plus className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm font-medium">
                      Add new task
                    </span>
                  </div>
                </Card>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(SingleBoard);
