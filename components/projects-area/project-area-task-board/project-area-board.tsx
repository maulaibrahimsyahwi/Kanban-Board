"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  const [boardWidth, setBoardWidth] = useState(300);
  const [orderedBoards, setOrderedBoards] = useState(boards);
  const { moveTask, reorderTasksInBoard } = useProjects();

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

  const autoScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const rect = container.getBoundingClientRect();
    const { scrollLeft, scrollWidth, clientWidth } = container;

    const now = Date.now();
    if (now - lastScrollTime.current < 16) {
      animationFrameId.current = requestAnimationFrame(autoScroll);
      return;
    }
    lastScrollTime.current = now;

    const edgeSize = 150;
    const maxScrollSpeed = 15;

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

    if (isDragging) {
      animationFrameId.current = requestAnimationFrame(autoScroll);
    }
  }, [isDragging]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      (window as any).__dragMouseX = e.clientX;
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      animationFrameId.current = requestAnimationFrame(autoScroll);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
      };
    }
  }, [isDragging, autoScroll]);

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

  const onDragStart = (start: DragStart) => {
    setIsDragging(true);
  };

  const onDragUpdate = (update: DragUpdate) => {
    if (!scrollContainerRef.current) return;
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

    if (type === "board") {
      const newBoards = Array.from(orderedBoards);
      const [movedBoard] = newBoards.splice(source.index, 1);
      newBoards.splice(destination.index, 0, movedBoard);
      setOrderedBoards(newBoards);
      return;
    }

    const sourceBoardId = source.droppableId;
    const destBoardId = destination.droppableId;

    const newBoards = orderedBoards.map((b) => ({ ...b, tasks: [...b.tasks] }));
    const sourceBoard = newBoards.find((b) => b.id === sourceBoardId);
    const destBoard = newBoards.find((b) => b.id === destBoardId);

    if (sourceBoard && destBoard) {
      const [movedTask] = sourceBoard.tasks.splice(source.index, 1);
      movedTask.boardId = destBoardId;
      destBoard.tasks.splice(destination.index, 0, movedTask);
      setOrderedBoards(newBoards);
    }

    if (sourceBoardId === destBoardId) {
      reorderTasksInBoard(sourceBoardId, source.index, destination.index);
    } else {
      moveTask(draggableId, sourceBoardId, destBoardId, destination.index);
    }
  };

  if (!isMounted) return null;

  if (!boards || boards.length === 0) {
    return <EmptyBoardsState />;
  }

  return (
    <div className="h-full w-full relative bg-secondary/5 flex flex-col">
      <DragDropContext
        onDragStart={onDragStart}
        onDragUpdate={onDragUpdate}
        onDragEnd={onDragEnd}
      >
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden"
          id="board-scroll-container"
          style={{ scrollBehavior: isDragging ? "auto" : "smooth" }}
        >
          <Droppable
            droppableId="all-boards"
            direction="horizontal"
            type="board"
          >
            {(provided) => (
              <div
                className="flex h-full p-4 gap-4"
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  width: "fit-content",
                  minWidth: "100%",
                }}
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
                        className="h-full shrink-0"
                        style={{
                          width: `${boardWidth}px`,
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
                <div
                  className="h-full shrink-0"
                  style={{ width: `${boardWidth}px` }}
                >
                  <AddBoardDialog
                    trigger={
                      <div className="w-full h-full p-1">
                        <div className="w-full h-full border-2 border-dashed border-border rounded-xl md:rounded-2xl flex items-center justify-center bg-card/50 hover:bg-muted/50 transition-colors cursor-pointer group">
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
