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
  Settings,
} from "lucide-react";
import { useProjects } from "@/contexts/projectContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

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
  const { selectedProject, projectStatuses, updateProjectStatus } =
    useProjects();
  const router = useRouter();

  const currentStatus =
    selectedProject?.status ||
    projectStatuses.find((s) => s.isSystem && s.name === "No status") ||
    projectStatuses[0];

  const handleStatusChange = (statusId: string) => {
    if (selectedProject) {
      updateProjectStatus(selectedProject.id, statusId);
    }
  };

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

        <DropdownMenu>
          <div className="relative group">
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-1 hover:bg-transparent"
              >
                {currentStatus ? (
                  <span
                    className={cn(
                      "px-3 py-1 rounded-md text-xs font-medium text-white transition-all",
                      currentStatus.color
                    )}
                  >
                    {currentStatus.name}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-md text-xs font-medium bg-slate-200 text-slate-600">
                    Loading...
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>

            <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-popover text-popover-foreground text-xs rounded-md border shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              The current project status. You can change it or create a new one
              in your profile settings.
            </div>
          </div>

          <DropdownMenuContent align="start" className="w-[160px] p-1">
            {projectStatuses.map((status) => (
              <DropdownMenuItem
                key={status.id}
                onClick={() => handleStatusChange(status.id)}
                className="cursor-pointer focus:bg-accent focus:text-accent-foreground p-1 mb-1"
              >
                <span
                  className={cn(
                    "w-full px-2 py-1 rounded-md text-xs font-medium text-center text-white",
                    status.color
                  )}
                >
                  {status.name}
                </span>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-xs flex items-center gap-2 text-muted-foreground"
              onClick={() => router.push("/settings/project-status")}
            >
              <Settings className="w-3 h-3" />
              Manage statuses
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
