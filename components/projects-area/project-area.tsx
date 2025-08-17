import { Card } from "../ui/card";
import ProjectAreaBoards from "./porject-area-task-board/project-area-board";
import ProjectAreaHeader from "./project-area-header/project-area-header";
import { useProjects } from "@/contexts/projectContext";

export default function ProjectArea() {
  const { selectedProject } = useProjects();

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

  const boards = selectedProject.boards || [];

  return (
    <Card className="shadow-none p-4 md:p-7 rounded-2xl md:rounded-3xl flex flex-col project-area-card">
      {" "}
      {/* Tambah project-area-card class */}
      <div className="flex-shrink-0 mb-4 md:mb-6">
        <ProjectAreaHeader projectName={selectedProject.name} />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden project-area-container">
        {" "}
        {/* Tambah classes */}
        <ProjectAreaBoards boards={boards} />
      </div>
    </Card>
  );
}
