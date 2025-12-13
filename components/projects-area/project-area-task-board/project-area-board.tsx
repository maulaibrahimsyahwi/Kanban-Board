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

  // State & Refs untuk Scroll Manual
  const [isDragging, setIsDragging] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setOrderedBoards(boards);
  }, [boards]);

  // --- LOGIKA AUTO-SCROLL BERBASIS CONTAINER (LEBIH PRESISI) ---
  const autoScroll = useCallback(() => {
    if (!isDragging || !mousePosRef.current || !scrollContainerRef.current) {
      return;
    }

    const { x } = mousePosRef.current;
    const container = scrollContainerRef.current;
    const rect = container.getBoundingClientRect();

    // KONFIGURASI ZONE
    // Kita gunakan batas container, bukan window.
    // Ini memperbaiki masalah jika ada Sidebar di kiri.
    const threshold = 120; // Mulai scroll 120px sebelum tepi container
    const maxSpeed = 20; // Kecepatan maksimal

    let scrollChange = 0;

    // Hitung jarak mouse ke tepi KANAN container
    // rect.right adalah batas kanan container di layar
    if (x > rect.right - threshold) {
      // Semakin dekat ke tepi (atau lewat), semakin cepat
      const intensity = Math.min(1, (x - (rect.right - threshold)) / threshold);
      scrollChange = maxSpeed * intensity;
    }
    // Hitung jarak mouse ke tepi KIRI container
    // rect.left adalah batas kiri container (setelah sidebar)
    else if (x < rect.left + threshold) {
      const intensity = Math.min(1, (rect.left + threshold - x) / threshold);
      scrollChange = -maxSpeed * intensity;
    }

    if (scrollChange !== 0) {
      container.scrollLeft += scrollChange;
    }

    animationFrameId.current = requestAnimationFrame(autoScroll);
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      // Mulai loop animasi scroll
      animationFrameId.current = requestAnimationFrame(autoScroll);

      // Listener Mouse Global
      const handleMouseMove = (e: MouseEvent) => {
        mousePosRef.current = { x: e.clientX, y: e.clientY };
      };

      // Listener Touch Global (untuk layar sentuh/trackpad hybrid)
      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches[0]) {
          mousePosRef.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
          };
        }
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      // Backup jika mouse keluar window saat drag
      window.addEventListener("dragover", (e) => {
        mousePosRef.current = { x: e.clientX, y: e.clientY };
      });

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("dragover", handleMouseMove);
        if (animationFrameId.current)
          cancelAnimationFrame(animationFrameId.current);
      };
    } else {
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
      mousePosRef.current = null;
    }
  }, [isDragging, autoScroll]);
  // -------------------------------------------------------------

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
    setIsDragging(false);

    // Stop loop segera
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
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
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        {/* Container Utama:
          - ref={scrollContainerRef} menangkap elemen ini.
          - overflow-x-auto memungkinkan scroll horizontal.
          - scroll-behavior: auto dipasang inline untuk mencegah konflik CSS smooth scroll saat di-drag.
        */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden"
          id="board-scroll-container"
          style={{ scrollBehavior: "auto" }}
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
                  width: "fit-content", // Pastikan container melebar sesuai konten
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
