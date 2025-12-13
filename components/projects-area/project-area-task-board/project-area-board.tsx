import { useState, useEffect } from "react";
import SingleBoard from "./single-board";
import { Board } from "@/types";
import { useProjects } from "@/contexts/projectContext";
import EmptyBoardsState from "@/components/projects-area/empty-board-state";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import AddBoardDialog from "@/components/add-board-dialog";
import { MdDashboardCustomize } from "react-icons/md";

export default function ProjectAreaBoards({
  boards = [],
}: {
  boards?: Board[];
}) {
  const [boardWidth, setBoardWidth] = useState(300);
  const { moveTask, reorderTasksInBoard } = useProjects();

  useEffect(() => {
    const calculateBoardWidth = () => {
      const width = window.innerWidth;
      if (width < 640) return 280;
      if (width < 768) return 300;
      if (width < 1024) return 320;
      if (width < 1280) return 340;
      return 360;
    };
    const updateBoardWidth = () => {
      setBoardWidth(calculateBoardWidth());
    };
    updateBoardWidth();
    window.addEventListener("resize", updateBoardWidth);
    return () => {
      window.removeEventListener("resize", updateBoardWidth);
    };
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    const sourceBoardId = source.droppableId;
    const destBoardId = destination.droppableId;
    if (sourceBoardId === destBoardId) {
      reorderTasksInBoard(sourceBoardId, source.index, destination.index);
    } else {
      moveTask(draggableId, sourceBoardId, destBoardId);
    }
  };

  if (!boards || boards.length === 0) {
    return <EmptyBoardsState />;
  }

  return (
    <div className="h-full flex flex-col w-full overflow-hidden">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto overflow-y-hidden boards-container">
          <div className="boards-wrapper flex h-full p-4 gap-4">
            {boards.map((board, index) => (
              <div
                key={board.id}
                className="single-board h-full shrink-0"
                style={{ width: `${boardWidth}px` }}
              >
                <SingleBoard
                  board={board}
                  boardIndex={index}
                  totalBoards={boards.length}
                />
              </div>
            ))}
            <div
              className="single-board h-full shrink-0"
              style={{ width: `${boardWidth}px` }}
            >
              <AddBoardDialog
                trigger={
                  <div className="w-full h-full p-1">
                    <div className="w-full h-full border-2 border-dashed border-border rounded-xl md:rounded-2xl flex items-center justify-center bg-card/50 hover:bg-muted/50 transition-colors cursor-pointer group">
                      <div className="text-center text-muted-foreground transition-colors group-hover:text-primary">
                        <MdDashboardCustomize className="w-6 h-6 mx-auto mb-2" />
                        <p className="font-semibold text-sm">Add New Board</p>
                      </div>
                    </div>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
