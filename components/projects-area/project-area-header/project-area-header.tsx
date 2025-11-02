import TaskDialog from "@/components/windows-dialogs/task-dialog/taskdialog";
import AddBoardDialog from "@/components/add-board-dialog";
import AllProjectsDialog from "@/components/windows-dialogs/all-projects-dialog/all-projects-dialog";
import SidebarToggleButton from "@/components/ui/sidebar-toggle-button";
import { Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/sidebarContext";
import FilterDropdown from "@/components/drop-downs/filter-dropdown";
import { DueDateFilter, PriorityFilter, ProgressFilter } from "@/types";

interface ProjectAreaHeaderProps {
  projectName: string;
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
  const { isRightSidebarVisible } = useSidebar();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <span className="text-xl md:text-2xl font-bold text-foreground truncate">
          {projectName}
        </span>
        <AllProjectsDialog
          trigger={
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground w-fit cursor-pointer"
            >
              <Grid3X3 className="w-4 h-4" />
              <span className="hidden xs:inline">All Projects</span>
              <span className="xs:hidden">Projects</span>
            </Button>
          }
        />
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

      <div className="flex items-center gap-2 sm:gap-3">
        <AddBoardDialog />
        <TaskDialog />
        {!isRightSidebarVisible && (
          <div className="hidden xl:block">
            <SidebarToggleButton
              variant="outline"
              className="text-muted-foreground hover:text-foreground"
            />
          </div>
        )}
      </div>
    </div>
  );
}
