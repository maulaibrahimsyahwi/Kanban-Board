import { useState, useRef, useEffect } from "react";
import SingleBoard from "./single-board";
import { Board, Task } from "@/types";
import { useProjects } from "@/contexts/projectContext";
import EmptyBoardsState from "@/components/projects-area/empty-board-state";
import SingleTask from "../project-area-task-board/single-task";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import AddBoardDialog from "@/components/add-board-dialog";
import { MdDashboardCustomize } from "react-icons/md";

export default function ProjectAreaBoards({
  boards = [],
}: {
  boards?: Board[];
}) {
  const [boardWidth, setBoardWidth] = useState(300);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { moveTask } = useProjects();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const element = scrollContainerRef.current;
    if (!element) return;

    return autoScrollForElements({
      element,
      canScroll: ({ source }) => source.data.type === "task",
    });
  }, []);

  useEffect(() => {
    return monitorForElements({
      onDragStart: ({ source }) => {
        if (source.data.type === "task") {
          const task = source.data.task as Task;
          setActiveTask(task);
          setIsDragging(true);

          if (scrollContainerRef.current) {
            scrollContainerRef.current.classList.add("drag-active");
          }
        }
      },
      onDrop: ({ source, location }) => {
        setActiveTask(null);
        setIsDragging(false);

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
  }, [moveTask]);

  if (!boards || boards.length === 0) {
    return <EmptyBoardsState />;
  }

  return (
    <div className="h-full flex flex-col w-full overflow-hidden">
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden boards-container"
        style={{
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
