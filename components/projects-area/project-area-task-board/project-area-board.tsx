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

  // 1. Ref untuk container scroll horizontal
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // 2. State untuk melacak apakah sedang drag
  const [isDragging, setIsDragging] = useState(false);
  // 3. Ref untuk menyimpan posisi mouse terakhir
  const mousePosRef = useRef<{ x: number } | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setOrderedBoards(boards);
  }, [boards]);

  // Logika Auto-Scroll Manual
  useEffect(() => {
    if (!isDragging) return;

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX };
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Interval untuk mengecek posisi mouse dan melakukan scroll
    const intervalId = setInterval(() => {
      if (!mousePosRef.current) return;

      const { x } = mousePosRef.current;
      const { innerWidth } = window;
      const edgeThreshold = 200; // Jarak pixel dari tepi layar untuk memicu scroll
      const maxScrollSpeed = 20; // Kecepatan scroll maksimal

      // Scroll ke Kanan
      if (x > innerWidth - edgeThreshold) {
        const intensity = (x - (innerWidth - edgeThreshold)) / edgeThreshold;
        scrollContainer.scrollLeft += maxScrollSpeed * intensity;
      }
      // Scroll ke Kiri
      else if (x < edgeThreshold) {
        const intensity = (edgeThreshold - x) / edgeThreshold;
        scrollContainer.scrollLeft -= maxScrollSpeed * intensity;
      }
    }, 10); // Jalankan setiap 10ms agar smooth

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(intervalId);
    };
  }, [isDragging]);

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

  const onDragEnd = (result: DropResult) => {
    setIsDragging(false); // Stop auto-scroll
    mousePosRef.current = null;

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

    if (sourceBoardId === destBoardId) {
      reorderTasksInBoard(sourceBoardId, source.index, destination.index);
    } else {
      moveTask(draggableId, sourceBoardId, destBoardId);
    }
  };

  if (!isMounted) {
    return null;
  }

  if (!boards || boards.length === 0) {
    return <EmptyBoardsState />;
  }

  return (
    <div className="h-full w-full relative overflow-hidden bg-secondary/5">
      {/* Tambahkan onDragStart */}
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div
          // Pasang ref di sini
          ref={scrollContainerRef}
          className="absolute inset-0 overflow-x-auto overflow-y-hidden"
          id="board-scroll-container"
          style={{
            // Pastikan scroll behavior auto agar tidak konflik dengan JS scroll manual
            scrollBehavior: "auto",
          }}
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
                    isDragDisabled={false}
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
