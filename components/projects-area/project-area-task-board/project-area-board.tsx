"use client";

import { useState, useEffect, useRef } from "react";
import SingleBoard from "./single-board";
import { Board } from "@/types";
import { useProjects } from "@/contexts/projectContext";
import EmptyBoardsState from "@/components/projects-area/empty-board-state";
import {
  DragDropContext,
  DropResult,
  Droppable,
  Draggable,
  DragStart,
  DragUpdate,
} from "@hello-pangea/dnd";
import AddBoardDialog from "@/components/add-board-dialog";
import { MdDashboardCustomize } from "react-icons/md";

export default function ProjectAreaBoards({
  boards = [],
}: {
  boards?: Board[];
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [orderedBoards, setOrderedBoards] = useState(boards);
  const { moveTask } = useProjects();

  const [isDragging, setIsDragging] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastScrollTime = useRef<number>(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setOrderedBoards(boards);
  }, [boards]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      (window as any).__dragMouseX = e.clientX;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        (window as any).__dragMouseX = e.touches[0].clientX;
      }
    };

    const tick = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const { scrollLeft, scrollWidth, clientWidth } = container;

      const now = Date.now();
      if (now - lastScrollTime.current < 16) {
        animationFrameId.current = requestAnimationFrame(tick);
        return;
      }
      lastScrollTime.current = now;

      const edgeSize = 150;
      const maxScrollSpeed = 20;

      let scrollAmount = 0;
      const mouseX = (window as any).__dragMouseX || 0;

      if (mouseX > 0) {
        const distanceFromRightEdge = rect.right - mouseX;
        const distanceFromLeftEdge = mouseX - rect.left;

        if (
          distanceFromRightEdge < edgeSize &&
          scrollLeft + clientWidth < scrollWidth
        ) {
          const intensity = 1 - distanceFromRightEdge / edgeSize;
          scrollAmount = maxScrollSpeed * intensity;
        } else if (distanceFromLeftEdge < edgeSize && scrollLeft > 0) {
          const intensity = 1 - distanceFromLeftEdge / edgeSize;
          scrollAmount = -maxScrollSpeed * intensity;
        }
      }

      if (scrollAmount !== 0) {
        container.scrollLeft += scrollAmount;
      }

      animationFrameId.current = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    animationFrameId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [isDragging]);

  const onDragStart = (start: DragStart) => {
    setIsDragging(true);
  };

  const onDragEnd = (result: DropResult) => {
    setIsDragging(false);
    (window as any).__dragMouseX = 0;

    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }

    const { source, destination, draggableId, type } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Reorder Board
    if (type === "board") {
      const newBoards = Array.from(orderedBoards);
      const [movedBoard] = newBoards.splice(source.index, 1);
      newBoards.splice(destination.index, 0, movedBoard);
      setOrderedBoards(newBoards);
      return;
    }

    // Reorder/Move Task
    const sourceBoardId = source.droppableId;
    const destBoardId = destination.droppableId;

    const newBoards = orderedBoards.map((b) => ({ ...b, tasks: [...b.tasks] }));
    const sourceBoard = newBoards.find((b) => b.id === sourceBoardId);
    const destBoard = newBoards.find((b) => b.id === destBoardId);

    if (sourceBoard && destBoard) {
      // Guard untuk case cepat/bersamaan (data berubah saat drag): splice bisa menghasilkan `undefined`
      const sourceTaskIndex = sourceBoard.tasks.findIndex(
        (task) => task.id === draggableId
      );

      if (sourceTaskIndex !== -1) {
        const [movedTask] = sourceBoard.tasks.splice(sourceTaskIndex, 1);
        if (movedTask) {
          const insertIndex = Math.max(
            0,
            Math.min(destination.index, destBoard.tasks.length)
          );
          destBoard.tasks.splice(insertIndex, 0, {
            ...movedTask,
            boardId: destBoardId,
          });
          setOrderedBoards(newBoards);
        }
      }
    }

    // Persist + optimistic update di context pakai `taskId`, lebih stabil daripada index saat list berubah.
    moveTask(draggableId, sourceBoardId, destBoardId, destination.index);
  };

  if (!isMounted) return null;

  if (!boards || boards.length === 0) {
    return <EmptyBoardsState />;
  }

  return (
    <div className="h-full w-full relative bg-secondary/5 flex flex-col">
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div
          ref={scrollContainerRef}
          className={`flex-1 overflow-x-auto overflow-y-hidden boards-container ${
            isDragging ? "drag-active" : ""
          }`}
          id="board-scroll-container"
        >
          <Droppable
            droppableId="all-boards"
            direction="horizontal"
            type="board"
          >
            {(provided) => (
              <div
                className="boards-wrapper"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {orderedBoards.map((board, index) => (
                  <Draggable
                    key={board.id}
                    draggableId={board.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="h-full board-column"
                        style={{
                          ...provided.draggableProps.style,
                        }}
                      >
                        <SingleBoard
                          board={board}
                          boardIndex={index}
                          totalBoards={orderedBoards.length}
                          dragHandleProps={provided.dragHandleProps}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}

                {/* Add Board Button Column */}
                <div className="h-full board-column">
                  <AddBoardDialog
                    trigger={
                      <div className="w-full h-full p-1">
                        <div className="w-full h-full border-2 border-dashed border-border rounded-xl md:rounded-2xl flex items-center justify-center bg-card/50 hover:bg-muted/50 transition-colors cursor-pointer group min-h-[150px]">
                          <div className="text-center text-muted-foreground transition-colors group-hover:text-primary">
                            <MdDashboardCustomize className="w-6 h-6 mx-auto mb-2" />
                            <p className="font-semibold text-sm">
                              Add New Board
                            </p>
                          </div>
                        </div>
                      </div>
                    }
                  />
                </div>
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    </div>
  );
}
