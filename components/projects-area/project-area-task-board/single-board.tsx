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
    <Droppable
      droppableId={boardId}
      type="task"
      // Penting: jangan jadikan Droppable sebagai scroll container.
      // Kalau Droppable punya `overflow-y-auto` dan parent boards juga `overflow-x-auto`,
      // @hello-pangea/dnd akan menghadapi nested scroll container -> posisi droppable offscreen
      // bisa tidak terupdate saat horizontal auto-scroll, sehingga drop ke board yang awalnya
      // tidak terlihat jadi terasa "terbatas".
      // Lebih aman untuk layout dengan horizontal scroll (boards-container) + auto-scroll:
      // hindari clipping oleh scroll container yang kadang membuat hitbox droppable terasa "terbatas".
      ignoreContainerClipping={true}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={cn(
            "w-full h-full border rounded-xl md:rounded-2xl bg-card flex flex-col transition-all duration-200 border-border p-3 md:p-4 max-h-full",
            snapshot.isDraggingOver ? "bg-muted/20" : ""
          )}
        >
          {/* Header Board */}
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

          {/* Task List Area - Ini adalah kuncinya: min-h-0 + flex-1 */}
          <div className="flex-1 min-h-0 flex flex-col relative">
            <div
              className={cn(
                "flex-1 min-h-0 transition-colors rounded-lg flex flex-col",
                snapshot.isDraggingOver ? "bg-muted/30" : ""
              )}
              style={{
                // Pastikan container punya tinggi
                height: "100%",
              }}
            >
              {/* Scroll area dipindah ke child untuk menghindari nested scroll container */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 task-scroll-container">
                <div className="flex flex-col gap-2 pb-2">
                  {tasks.length === 0 && !snapshot.isDraggingOver ? (
                    <div className="flex items-center justify-center h-20 text-center mb-2">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        No tasks yet
                      </p>
                    </div>
                  ) : (
                    tasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
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

                  {/* Tombol Add Task ditaruh di dalam scroll area */}
                  <div className="mt-1 flex-shrink-0">
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
          </div>
        </div>
      )}
    </Droppable>
  );
};
export default memo(SingleBoard);
