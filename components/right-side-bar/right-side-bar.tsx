import { Card } from "@/components/ui/card";
import CircularProgress from "./circular-progress";
import TasksStats from "./task-stats";
import ProjectSelectionDropDown from "../drop-downs/project-selection/project-selection";
import SidebarToggleButton from "@/components/ui/sidebar-toggle-button";
import { useProjects } from "@/contexts/projectContext";

export default function RightSideBar() {
  const { selectedProject } = useProjects();

  if (!selectedProject) {
    return (
      <Card className="shadow-none p-4 md:p-6 rounded-2xl md:rounded-3xl flex items-center justify-center right-sidebar-card">
        <div className="text-center text-muted-foreground">
          <p className="text-sm md:text-base">No project created</p>
          <p className="text-xs md:text-sm">
            Create or select a project to view stats
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-none p-4 md:p-6 rounded-2xl md:rounded-3xl overflow-y-auto right-sidebar-card">
      <div className="flex flex-col gap-0 w-full">
        <div className="flex-shrink-0 w-full mb-5">
          <div className="flex justify-between gap-2">
            <div className="flex-1 min-w-0">
              <ProjectSelectionDropDown />
            </div>
            {/* Show toggle button only on xl screens and above */}
            <div className="hidden xl:block flex-shrink-0 mt-1.5">
              <SidebarToggleButton
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground p-2"
              />
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center w-full">
          <CircularProgress />
        </div>
        <div className="flex-shrink-0 w-full">
          <TasksStats />
        </div>
      </div>
    </Card>
  );
}
