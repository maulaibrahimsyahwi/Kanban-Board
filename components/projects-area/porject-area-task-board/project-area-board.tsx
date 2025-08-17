// project-area-board.tsx - Full enhanced auto-scroll implementation
import { useState, useRef, useCallback, useEffect } from "react";
import SingleBoard from "./single-board";
import { Board, Task } from "@/contexts/projectContext";
import { useProjects } from "@/contexts/projectContext";
import EmptyBoardsState from "@/components/projects-area/empty-board-state";
import SingleTask from "./single-task";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

export default function ProjectAreaBoards({
  boards = [],
}: {
  boards?: Board[];
}) {
  const [boardWidth, setBoardWidth] = useState(300);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { moveTask, selectedProject } = useProjects();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<number | null>(null);

  // Enhanced auto-scroll dengan kecepatan tinggi seperti Atlassian
  const startAutoScroll = useCallback(
    (direction: "left" | "right", speed: number) => {
      // Stop existing scroll
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
      }

      const scroll = () => {
        if (!scrollContainerRef.current || !isDragging) {
          autoScrollRef.current = null;
          return;
        }

        const container = scrollContainerRef.current;

        if (direction === "left") {
          container.scrollLeft -= speed;
          // Stop jika sudah di awal
          if (container.scrollLeft <= 0) {
            autoScrollRef.current = null;
            return;
          }
        } else {
          container.scrollLeft += speed;
          // Stop jika sudah di akhir
          const maxScroll = container.scrollWidth - container.clientWidth;
          if (container.scrollLeft >= maxScroll) {
            autoScrollRef.current = null;
            return;
          }
        }

        autoScrollRef.current = requestAnimationFrame(scroll);
      };

      autoScrollRef.current = requestAnimationFrame(scroll);
    },
    [isDragging]
  );

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRef.current) {
      cancelAnimationFrame(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  }, []);

  // Handle auto-scroll berdasarkan posisi mouse
  const handleAutoScroll = useCallback(
    (clientX: number) => {
      if (!scrollContainerRef.current) return;

      const container = scrollContainerRef.current;
      const rect = container.getBoundingClientRect();

      // Zona scroll dengan kecepatan berbeda
      const ultraFastZone = 50; // 0-50px dari edge: ultra cepat
      const fastZone = 120; // 50-120px dari edge: cepat
      const normalZone = 200; // 120-200px dari edge: normal

      const containerLeft = rect.left;
      const containerRight = rect.right;
      const leftDistance = clientX - containerLeft;
      const rightDistance = containerRight - clientX;

      // Scroll ke kiri
      if (leftDistance <= normalZone && container.scrollLeft > 0) {
        let scrollSpeed = 10; // Base speed

        if (leftDistance <= ultraFastZone) {
          scrollSpeed = 50; // Ultra cepat seperti Atlassian
        } else if (leftDistance <= fastZone) {
          scrollSpeed = 30; // Cepat
        } else {
          scrollSpeed = 15; // Normal
        }

        startAutoScroll("left", scrollSpeed);
        return;
      }

      // Scroll ke kanan
      if (
        rightDistance <= normalZone &&
        container.scrollLeft < container.scrollWidth - container.clientWidth
      ) {
        let scrollSpeed = 10; // Base speed

        if (rightDistance <= ultraFastZone) {
          scrollSpeed = 50; // Ultra cepat seperti Atlassian
        } else if (rightDistance <= fastZone) {
          scrollSpeed = 30; // Cepat
        } else {
          scrollSpeed = 15; // Normal
        }

        startAutoScroll("right", scrollSpeed);
        return;
      }

      // Stop jika tidak di zona scroll
      stopAutoScroll();
    },
    [startAutoScroll, stopAutoScroll]
  );

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

  // Atlaskit drag and drop monitor
  useEffect(() => {
    return monitorForElements({
      onDragStart: ({ source }) => {
        if (source.data.type === "task") {
          const task = source.data.task as Task;
          setActiveTask(task);
          setIsDragging(true);

          // Add visual class untuk feedback
          if (scrollContainerRef.current) {
            scrollContainerRef.current.classList.add("drag-active");
          }
        }
      },
      onDrag: ({ location }) => {
        if (isDragging && location.current.input) {
          const clientX = location.current.input.clientX;
          handleAutoScroll(clientX);
        }
      },
      onDrop: ({ source, location }) => {
        setActiveTask(null);
        setIsDragging(false);
        stopAutoScroll();

        // Remove visual class
        if (scrollContainerRef.current) {
          scrollContainerRef.current.classList.remove("drag-active");
        }

        if (source.data.type !== "task") return;

        const taskId = source.data.taskId as string;
        const sourceBoardId = source.data.boardId as string;

        const targetBoardData = location.current.dropTargets.find(
          (target) => target.data.type === "board"
        );

        if (targetBoardData) {
          const targetBoardId = targetBoardData.data.boardId as string;

          if (sourceBoardId !== targetBoardId) {
            moveTask(taskId, sourceBoardId, targetBoardId);
          }
        }
      },
    });
  }, [moveTask, stopAutoScroll, isDragging, handleAutoScroll]);

  if (!boards || boards.length === 0) {
    return <EmptyBoardsState />;
  }

  return (
    <div className="h-full flex flex-col w-full overflow-hidden">
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden boards-container"
        style={{
          // Disable smooth scrolling saat drag untuk response instant
          scrollBehavior: isDragging ? "auto" : "smooth",
        }}
      >
        <div className="boards-wrapper">
          {boards.map((board, index) => (
            <div
              key={board.id}
              className="single-board h-full"
              style={{ width: `${boardWidth}px` }}
            >
              <SingleBoard
                board={board}
                boardIndex={index}
                totalBoards={boards.length}
              />
            </div>
          ))}
        </div>

        {/* Drag preview */}
        {activeTask && isDragging && (
          <div
            className="fixed pointer-events-none z-50 transform rotate-6 opacity-90"
            style={{
              left: "-9999px",
              top: "-9999px",
            }}
          >
            <SingleTask task={activeTask} boardId="" isDragPreview={true} />
          </div>
        )}
      </div>
    </div>
  );
}
