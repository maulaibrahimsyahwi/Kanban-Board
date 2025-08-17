import TaskDialog from "@/components/windows-dialogs/task-dialog/taskdialog";
import AddBoardDialog from "@/components/add-board-dialog";
import AllProjectsDialog from "@/components/windows-dialogs/all-projects-dialog/all-projects-dialog";
import { Separator } from "@/components/ui/separator";
import { Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProjectAreaHeader({
  projectName,
}: {
  projectName: string;
}) {
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

      <div className="flex items-center gap-2 sm:gap-3 ">
        <AddBoardDialog />
        <Separator orientation="vertical" className="h-6 hidden sm:block" />
        <TaskDialog />
      </div>
    </div>
  );
}
