import TaskDialog from "@/components/windows-dialogs/task-dialog/taskdialog";
import AddBoardDialog from "@/components/add-board-dialog";
import AllProjectsDialog from "@/components/windows-dialogs/all-projects-dialog/all-projects-dialog";
import SidebarToggleButton from "@/components/ui/sidebar-toggle-button";
import { Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/sidebarContext";

export default function ProjectAreaHeader({
  projectName,
}: {
  projectName: string;
}) {
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
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <AddBoardDialog />
        <TaskDialog />
        {/* Show toggle button only when sidebar is hidden and on xl screens and above */}
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
