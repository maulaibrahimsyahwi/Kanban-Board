import { memo } from "react";
import {
  Droppable,
  Draggable,
  DraggableProvidedDragHandleProps,
} from "@hello-pangea/dnd";
import SingleTask from "./single-task";
import { Board } from "@/types";
import TaskDialog from "@/components/windows-dialogs/task-dialog/taskdialog";
import BoardDropDown from "@/components/board-dropdown-menu";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SingleBoardProps {
  board: Board;
  boardIndex: number;
  totalBoards: number;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
}

const SingleBoard = ({
  board,
  boardIndex,
  totalBoards,
  dragHandleProps,
}: SingleBoardProps) => {
  const { name: boardName, tasks, id: boardId } = board;

  return (
    <div
      className={cn(
        "w-full h-full border rounded-xl md:rounded-2xl bg-card flex flex-col transition-all duration-200 border-border p-3 md:p-4 single-board"
      )}
    >
      <div
        {...dragHandleProps}
        className="bg-muted/50 flex justify-between p-2 sm:p-3 md:p-4 rounded-lg items-center mb-3 md:mb-4 flex-shrink-0 min-h-[3rem] sm:min-h-[3.5rem] group cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 min-w-0 flex-1">
          <span className="font-medium text-xs sm:text-sm md:text-base text-foreground truncate leading-tight">
            {boardName}
          </span>
          <div className="bg-primary text-primary-foreground rounded-full w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex items-center justify-center text-[10px] sm:text-xs md:text-sm font-bold flex-shrink-0">
            <span>{tasks.length}</span>
          </div>
        </div>
        <div className="flex-shrink-0 ml-1 sm:ml-2">
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <BoardDropDown
              board={board}
              boardIndex={boardIndex}
              totalBoards={totalBoards}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 relative">
        <Droppable
          droppableId={boardId}
          type="task"
          ignoreContainerClipping={true}
        >
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={cn(
                // PERBAIKAN: Tambahkan 'h-full' agar area drop mengisi seluruh sisa ruang board
                "flex-1 h-full overflow-y-auto pr-1 task-scroll-container transition-colors rounded-lg flex flex-col",
                snapshot.isDraggingOver ? "bg-muted/50" : ""
              )}
              style={{
                // Pastikan minHeight 100% dari parent container agar tidak ada area mati (dead zone)
                minHeight: "100%",
              }}
            >
              {tasks.length === 0 && !snapshot.isDraggingOver ? (
                <div className="flex items-center justify-center h-20 text-center mb-2">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    No tasks yet
                  </p>
                </div>
              ) : (
                tasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided, snapshot) => (
                      <SingleTask
                        task={task}
                        boardId={boardId}
                        taskIndex={index}
                        totalTasks={tasks.length}
                        provided={provided}
                        snapshot={snapshot}
                      />
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}

              {/* Tombol Add Task diletakkan di bagian bawah flow, tapi tetap di dalam container droppable */}
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

              {/* Spacer agar area drop tetap aktif sampai paling bawah */}
              <div className="flex-grow min-h-[20px]" />
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
};
export default memo(SingleBoard);
