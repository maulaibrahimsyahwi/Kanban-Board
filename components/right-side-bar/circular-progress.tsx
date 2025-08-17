import { useProjects } from "@/contexts/projectContext";

export default function CircularProgress() {
  const { selectedProject } = useProjects();

  if (!selectedProject) {
    return (
      <div className="flex justify-center items-center">
        <div className="size-32 sm:size-36 md:size-40 lg:size-44 rounded-full border-4 border-muted flex items-center justify-center">
          <span className="text-muted-foreground text-sm md:text-base">
            No Data
          </span>
        </div>
      </div>
    );
  }

  const totalTasks = selectedProject.boards.reduce(
    (total, board) => total + board.tasks.length,
    0
  );
  const lastBoard = selectedProject.boards[selectedProject.boards.length - 1];
  const completedTasks = lastBoard?.tasks.length || 0;
  const percentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex justify-center items-center">
      <div className="relative size-32 sm:size-36 md:size-40 lg:size-44">
        <svg
          className="transform -rotate-90 size-full"
          viewBox="0 0 140 140"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="var(--muted)"
            strokeWidth="5"
            fill="transparent"
            className="opacity-30"
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="var(--primary)"
            strokeWidth="5"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
            style={{
              filter: "drop-shadow(0 0 4px var(--primary))",
            }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-primary">
              {percentage}%
            </div>
            <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
              Complete
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
