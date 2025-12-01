"use client";

import FilterDropdown from "@/components/drop-downs/filter-dropdown";
import {
  DueDateFilter,
  PriorityFilter,
  ProgressFilter,
  ProjectAreaView,
} from "@/types";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  BarChartHorizontal,
  LayoutGrid,
  ListChecks,
  Users,
} from "lucide-react";
import { useProjects } from "@/contexts/projectContext";

interface ProjectAreaHeaderProps {
  projectName: string;
  currentView: ProjectAreaView;
  setCurrentView: (view: ProjectAreaView) => void;
  dueDates: Set<DueDateFilter>;
  setDueDates: React.Dispatch<React.SetStateAction<Set<DueDateFilter>>>;
  priorities: Set<PriorityFilter>;
  setPriorities: React.Dispatch<React.SetStateAction<Set<PriorityFilter>>>;
  progresses: Set<ProgressFilter>;
  setProgresses: React.Dispatch<React.SetStateAction<Set<ProgressFilter>>>;
  labels: Set<string>;
  setLabels: React.Dispatch<React.SetStateAction<Set<string>>>;
  boards: Set<string>;
  setBoards: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export default function ProjectAreaHeader({
  projectName,
  currentView,
  setCurrentView,
  dueDates,
  setDueDates,
  priorities,
  setPriorities,
  progresses,
  setProgresses,
  labels,
  setLabels,
  boards,
  setBoards,
}: ProjectAreaHeaderProps) {
  const { selectedProject } = useProjects();

  const isBoards = currentView === "boards";
  const isCalendar = currentView === "calendar";
  const isChart = currentView === "chart";
  const isList = currentView === "list";
  const isPeople = currentView === "people";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <span className="text-xl md:text-2xl font-bold text-foreground truncate">
          {projectName}
        </span>

        <FilterDropdown
          dueDates={dueDates}
          setDueDates={setDueDates}
          priorities={priorities}
          setPriorities={setPriorities}
          progresses={progresses}
          setProgresses={setProgresses}
          labels={labels}
          setLabels={setLabels}
          boards={boards}
          setBoards={setBoards}
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <Button
          variant={isList ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setCurrentView("list")}
        >
          <ListChecks className="w-4 h-4" />
          <span className="hidden sm:inline">List</span>
        </Button>
        <Button
          variant={isBoards ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setCurrentView("boards")}
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="hidden sm:inline">Board</span>
        </Button>
        <Button
          variant={isCalendar ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setCurrentView("calendar")}
        >
          <Calendar className="w-4 h-4" />
          <span className="hidden sm:inline">Calendar</span>
        </Button>
        <Button
          variant={isChart ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setCurrentView("chart")}
        >
          <BarChartHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Bagan</span>
        </Button>
        <Button
          variant={isPeople ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setCurrentView("people")}
        >
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">People</span>
        </Button>
      </div>
    </div>
  );
}
