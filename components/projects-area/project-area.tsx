import { Card } from "../ui/card";
import ProjectAreaBoards from "./project-area-task-board/project-area-board";
import ProjectAreaHeader from "./project-area-header/project-area-header";
import { useProjects } from "@/contexts/projectContext";
import { useState, useMemo } from "react";
import { DueDateFilter, PriorityFilter, ProgressFilter } from "@/types";

// --- Fungsi Helper untuk Logika Filter Tanggal ---

const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const getTomorrow = (today: Date) => {
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  return tomorrow;
};

const getWeekRange = (today: Date) => {
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Asumsi Senin adalah awal minggu
  startOfWeek.setDate(diff);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  return { startOfWeek, endOfWeek };
};

const getNextWeekRange = (endOfWeek: Date) => {
  const startOfNextWeek = new Date(endOfWeek);
  startOfNextWeek.setDate(endOfWeek.getDate() + 1);
  const endOfNextWeek = new Date(startOfNextWeek);
  endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
  return { startOfNextWeek, endOfNextWeek };
};

// --- Komponen Utama ---

export default function ProjectArea() {
  const { selectedProject } = useProjects();

  // --- State Filter Diangkat ke Sini ---
  const [dueDates, setDueDates] = useState<Set<DueDateFilter>>(new Set());
  const [priorities, setPriorities] = useState<Set<PriorityFilter>>(new Set());
  const [progresses, setProgresses] = useState<Set<ProgressFilter>>(new Set());
  const [labels, setLabels] = useState<Set<string>>(new Set());
  const [boardsFilter, setBoardsFilter] = useState<Set<string>>(new Set());

  // --- Logika Penyaringan ---
  const filteredBoards = useMemo(() => {
    if (!selectedProject) return [];

    const hasActiveFilters =
      dueDates.size > 0 ||
      priorities.size > 0 ||
      progresses.size > 0 ||
      labels.size > 0 ||
      boardsFilter.size > 0;

    if (!hasActiveFilters) {
      return selectedProject.boards;
    }

    // Variabel tanggal untuk perbandingan
    const today = getToday();
    const tomorrow = getTomorrow(today);
    const { startOfWeek, endOfWeek } = getWeekRange(today);
    const { startOfNextWeek, endOfNextWeek } = getNextWeekRange(endOfWeek);

    // 1. Filter papan (boards) terlebih dahulu jika ada filter papan
    const boardsToDisplay =
      boardsFilter.size > 0
        ? selectedProject.boards.filter((board) => boardsFilter.has(board.id))
        : selectedProject.boards;

    // 2. Filter tugas (tasks) di dalam papan yang tersisa
    return boardsToDisplay.map((board) => {
      const filteredTasks = board.tasks.filter((task) => {
        // Cek setiap kategori filter
        const taskDate = task.dueDate ? new Date(task.dueDate) : null;
        if (taskDate) taskDate.setHours(0, 0, 0, 0);
        const taskTime = taskDate?.getTime();

        const dueDateCheck = () => {
          if (dueDates.size === 0) return true;
          if (dueDates.has("no-date") && taskDate === null) return true;
          if (!taskDate || !taskTime) return false;

          if (
            dueDates.has("overdue") &&
            taskTime < today.getTime() &&
            task.progress !== "completed"
          )
            return true;
          if (dueDates.has("today") && taskTime === today.getTime())
            return true;
          if (dueDates.has("tomorrow") && taskTime === tomorrow.getTime())
            return true;
          if (
            dueDates.has("this-week") &&
            taskTime >= startOfWeek.getTime() &&
            taskTime <= endOfWeek.getTime()
          )
            return true;
          if (
            dueDates.has("next-week") &&
            taskTime >= startOfNextWeek.getTime() &&
            taskTime <= endOfNextWeek.getTime()
          )
            return true;
          if (dueDates.has("upcoming") && taskTime > endOfNextWeek.getTime())
            return true;

          return false;
        };

        const priorityCheck = () => {
          if (priorities.size === 0) return true;
          return priorities.has(task.priority);
        };

        const progressCheck = () => {
          if (progresses.size === 0) return true;
          return progresses.has(task.progress);
        };

        const labelCheck = () => {
          if (labels.size === 0) return true;
          if (task.labels.length === 0) return false;
          return task.labels.some((label) => labels.has(label.name));
        };

        // Tugas harus lolos SEMUA cek filter
        return (
          dueDateCheck() && priorityCheck() && progressCheck() && labelCheck()
        );
      });

      return {
        ...board,
        tasks: filteredTasks,
      };
    });
  }, [selectedProject, dueDates, priorities, progresses, labels, boardsFilter]);

  if (!selectedProject) {
    return (
      <Card className="shadow-none p-4 md:p-7 rounded-2xl md:rounded-3xl flex justify-center items-center">
        <div className="text-center px-4">
          <h2 className="text-lg md:text-xl text-muted-foreground mb-2">
            No project created
          </h2>
          <p className="text-sm text-muted-foreground">
            Select a project from the sidebar or create a new one to get
            started.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-none p-4 md:p-7 rounded-2xl md:rounded-3xl flex flex-col project-area-card">
      <div className="flex-shrink-0 mb-4 md:mb-6">
        <ProjectAreaHeader
          projectName={selectedProject.name}
          dueDates={dueDates}
          setDueDates={setDueDates}
          priorities={priorities}
          setPriorities={setPriorities}
          progresses={progresses}
          setProgresses={setProgresses}
          labels={labels}
          setLabels={setLabels}
          boards={boardsFilter}
          setBoards={setBoardsFilter}
        />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden project-area-container">
        <ProjectAreaBoards boards={filteredBoards} />
      </div>
    </Card>
  );
}
