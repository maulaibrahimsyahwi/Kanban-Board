"use client";

import { Card } from "../ui/card";
import ProjectAreaBoards from "./project-area-task-board/project-area-board";
import ProjectAreaHeader from "./project-area-header/project-area-header";
import { useProjects } from "@/contexts/projectContext";
import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  DueDateFilter,
  PriorityFilter,
  ProgressFilter,
  ProjectAreaView,
} from "@/types";

const LoadingView = () => (
  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
    Loading...
  </div>
);

const ChartView = dynamic(() => import("../chart-view/ChartView"), {
  ssr: false,
  loading: LoadingView,
});
const CalendarView = dynamic(() => import("../calendar-view/CalendarView"), {
  ssr: false,
  loading: LoadingView,
});
const ListView = dynamic(() => import("./list-view/ListView"), {
  ssr: false,
  loading: LoadingView,
});
const PeopleView = dynamic(() => import("./people-view/people-view"), {
  ssr: false,
  loading: LoadingView,
});

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
  const start = new Date(today);
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { startOfWeek: start, endOfWeek: end };
};

const getNextWeekRange = (endOfWeek: Date) => {
  const startOfNextWeek = new Date(endOfWeek);
  startOfNextWeek.setDate(endOfWeek.getDate() + 1);
  startOfNextWeek.setHours(0, 0, 0, 0);

  const endOfNextWeek = new Date(startOfNextWeek);
  endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
  endOfNextWeek.setHours(23, 59, 59, 999);
  return { startOfNextWeek, endOfNextWeek };
};

export default function ProjectArea() {
  const { selectedProject } = useProjects();

  const [currentView, setCurrentView] = useState<ProjectAreaView>("boards");

  const [dueDates, setDueDates] = useState<Set<DueDateFilter>>(new Set());
  const [priorities, setPriorities] = useState<Set<PriorityFilter>>(new Set());
  const [progresses, setProgresses] = useState<Set<ProgressFilter>>(new Set());
  const [labels, setLabels] = useState<Set<string>>(new Set());
  const [boardsFilter, setBoardsFilter] = useState<Set<string>>(new Set());

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

    const today = getToday();
    const tomorrow = getTomorrow(today);
    const { startOfWeek, endOfWeek } = getWeekRange(today);
    const { startOfNextWeek, endOfNextWeek } = getNextWeekRange(endOfWeek);

    const boardsToDisplay =
      boardsFilter.size > 0
        ? selectedProject.boards.filter((board) => boardsFilter.has(board.id))
        : selectedProject.boards;

    return boardsToDisplay.map((board) => {
      const filteredTasks = board.tasks.filter((task) => {
        const taskDueDate = task.dueDate ? new Date(task.dueDate) : null;
        if (taskDueDate) {
          taskDueDate.setHours(0, 0, 0, 0);
        }
        const taskTime = taskDueDate?.getTime();

        const dueDateCheck = () => {
          if (dueDates.size === 0) return true;
          if (dueDates.has("no-date") && !taskDueDate) return true;
          if (!taskDueDate || !taskTime) return false;

          if (
            dueDates.has("overdue") &&
            taskTime < today.getTime() &&
            task.progress !== "done"
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
      <Card className="shadow-none p-4 md:p-7 rounded-2xl md:rounded-3xl flex justify-center items-center h-full !border-0">
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

  const renderContent = () => {
    switch (currentView) {
      case "chart":
        return <ChartView />;
      case "calendar":
        return <CalendarView />;
      case "list":
        return <ListView filteredBoards={filteredBoards} />;
      case "people":
        return <PeopleView />;
      case "boards":
      default:
        return <ProjectAreaBoards boards={filteredBoards} />;
    }
  };

  return (
    <Card className="shadow-none rounded-2xl md:rounded-3xl flex flex-col project-area-card h-full !border-0 bg-transparent">
      <div className="flex-shrink-0 p-4">
        <ProjectAreaHeader
          projectName={selectedProject.name}
          currentView={currentView}
          setCurrentView={setCurrentView}
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
      <div className="flex-1 min-h-0 overflow-hidden project-area-container px-4 pb-4">
        {renderContent()}
      </div>
    </Card>
  );
}
