import { Separator } from "@radix-ui/react-separator";
import { useProjects } from "@/contexts/projectContext";

type TaskCard = {
  label: string;
  value: number;
};

export default function TasksStats() {
  const { selectedProject } = useProjects();

  if (!selectedProject) {
    return null;
  }

  const boards = selectedProject.boards;
  const totalTasks = boards.reduce(
    (total, board) => total + board.tasks.length,
    0
  );

  // Board pertama (waiting tasks)
  const firstBoard = boards[0];
  const waitingTasks = firstBoard?.tasks.length || 0;

  // Board terakhir (completed tasks)
  const lastBoard = boards[boards.length - 1];
  const completedTasks = lastBoard?.tasks.length || 0;

  // In progress tasks: semua board kecuali yang pertama dan terakhir
  const inProgressTasks =
    boards.length > 2
      ? boards
          .slice(1, -1)
          .reduce((total, board) => total + board.tasks.length, 0)
      : 0;

  const statisticCards: TaskCard[] = [
    { label: "total", value: totalTasks },
    { label: "waiting", value: waitingTasks },
    { label: "in progress", value: inProgressTasks },
    { label: "completed", value: completedTasks },
  ];

  return (
    <div className="flex flex-col gap-1 sm:gap-2">
      <span className="font-bold text-base sm:text-lg md:text-xl">Tasks</span>
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:gap-3 mt-1 sm:mt-2 md:mt-3">
        {statisticCards.map((statCard, index) => (
          <SingleCard key={index} statCard={statCard} />
        ))}
      </div>
    </div>
  );
}

function SingleCard({ statCard }: { statCard: TaskCard }) {
  return (
    <div className="p-2 sm:p-2.5 md:p-3 bg-muted rounded-lg md:rounded-xl">
      <span className="text-muted-foreground text-[9px] sm:text-[10px] md:text-[12px] font-medium">
        {statCard.label.toUpperCase()}
      </span>
      <div className="flex gap-1 md:gap-2 mt-0.5 sm:mt-1 items-center">
        <Separator
          className="w-1 h-2.5 sm:h-3 md:h-4 bg-primary"
          orientation="vertical"
        />
        <span className="font-bold text-sm sm:text-base md:text-lg text-foreground">
          {statCard.value}
        </span>
      </div>
    </div>
  );
}
