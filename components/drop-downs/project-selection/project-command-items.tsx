import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
import { Project } from "@/types";
import { SingleProjectCommandItem } from "./singleProjectItem";

interface ProjectCommandItemsProps {
  projects: Project[];
  selectedProject: Project;
  onSelectProject: (projectId: string) => void;
}

export default function ProjectCommandItems({
  projects,
  selectedProject,
  onSelectProject,
}: ProjectCommandItemsProps) {
  const handleSelectProject = (project: Project) => {
    onSelectProject(project.id);
  };

  return (
    <Command className="rounded-lg border-none shadow-none">
      <CommandInput
        placeholder="Search projects..."
        className="h-9 border-none focus:ring-0"
      />
      <CommandList className="max-h-[200px] overflow-y-auto">
        <CommandEmpty>No projects found.</CommandEmpty>
        {projects.map((project) => (
          <SingleProjectCommandItem
            key={project.id}
            project={project}
            isSelected={selectedProject.id === project.id}
            onSelectedItem={handleSelectProject}
          />
        ))}
      </CommandList>
    </Command>
  );
}
