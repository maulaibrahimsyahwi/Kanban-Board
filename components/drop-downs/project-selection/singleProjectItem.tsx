import { CommandItem } from "@/components/ui/command";
import { Project } from "@/contexts/projectContext";
import { Check } from "lucide-react";

export function SingleProjectCommandItem({
  project,
  isSelected,
  onSelectedItem,
}: {
  project: Project;
  isSelected: boolean;
  onSelectedItem: (project: Project) => void;
}) {
  const { name: projectName, boards, icon: ProjectIcon } = project;

  // Calculate total tasks across all boards
  const totalTasks = boards.reduce(
    (total, board) => total + board.tasks.length,
    0
  );

  const handleSelect = () => {
    onSelectedItem(project);
  };

  return (
    <CommandItem
      value={projectName}
      onSelect={handleSelect}
      className="cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-lg p-3 data-[selected]:bg-accent data-[selected]:text-accent-foreground"
    >
      <div className="flex items-center justify-between w-full min-w-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="size-8 bg-primary flex items-center justify-center rounded-md text-primary-foreground flex-shrink-0">
            {ProjectIcon && <ProjectIcon />}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span
              className="font-medium text-foreground truncate w-full text-left"
              title={projectName} // Show full name on hover
            >
              {projectName}
            </span>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {totalTasks} Task{totalTasks !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        {isSelected && (
          <div className="text-primary flex-shrink-0 ml-2">
            <Check size={16} />
          </div>
        )}
      </div>
    </CommandItem>
  );
}
