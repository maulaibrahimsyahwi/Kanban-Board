"use client";

import { useProjects } from "@/contexts/projectContext";
import { Task } from "@/types";
import StatusChart from "./StatusChart";
import BarChart, { BarChartData } from "./BarChart";

const stackColors = {
  notStarted: "bg-gray-400",
  inProgress: "bg-blue-500",
  overdue: "bg-red-500",
  completed: "bg-green-500",
};

const legend = [
  { label: "Not started", color: stackColors.notStarted },
  { label: "In progress", color: stackColors.inProgress },
  { label: "Overdue", color: stackColors.overdue },
  { label: "Done", color: stackColors.completed },
];

const getTaskStacks = (tasks: Task[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let notStarted = 0;
  let inProgress = 0;
  let overdue = 0;
  let completed = 0;

  tasks.forEach((task) => {
    const isOverdue =
      task.dueDate &&
      new Date(task.dueDate) < today &&
      task.progress !== "done";

    if (isOverdue) {
      overdue++;
    } else if (task.progress === "done") {
      completed++;
    } else if (task.progress === "in_progress") {
      inProgress++;
    } else {
      notStarted++;
    }
  });

  return [
    {
      value: notStarted,
      color: stackColors.notStarted,
      label: "Not started",
    },
    { value: inProgress, color: stackColors.inProgress, label: "In progress" },
    { value: overdue, color: stackColors.overdue, label: "Overdue" },
    { value: completed, color: stackColors.completed, label: "Done" },
  ];
};

export default function ChartView() {
  const { selectedProject } = useProjects();

  if (!selectedProject) {
    return (
      <div className="text-muted-foreground">
        Select a project to view charts.
      </div>
    );
  }

  const allTasks = selectedProject.boards.flatMap((board) => board.tasks);

  // Data untuk Bagan "Wadah" (Boards)
  const boardChartData: BarChartData[] = selectedProject.boards.map(
    (board, index) => ({
      label:
        board.name.length > 10 ? board.name.substring(0, 8) + ".." : board.name,
      stacks: getTaskStacks(board.tasks),
    })
  );

  // Data untuk Bagan "Prioritas"
  const priorityChartData: BarChartData[] = [
    {
      label: "Critical",
      stacks: getTaskStacks(allTasks.filter((t) => t.priority === "critical")),
    },
    {
      label: "High",
      stacks: getTaskStacks(allTasks.filter((t) => t.priority === "high")),
    },
    {
      label: "Medium",
      stacks: getTaskStacks(allTasks.filter((t) => t.priority === "medium")),
    },
    {
      label: "Low",
      stacks: getTaskStacks(allTasks.filter((t) => t.priority === "low")),
    },
  ];

  // Data untuk Bagan "Anggota" (Members)
  const allMembers = [selectedProject.owner, ...selectedProject.members];

  const memberChartData: BarChartData[] = [
    { label: "Unassigned", stacks: getTaskStacks(allTasks) },
    ...allMembers.map((m) => ({
      label: (m.name || m.email || "Unknown").split(" ")[0],
      stacks: getTaskStacks([]), // Placeholder: Belum ada assignment task
    })),
  ];

  return (
    <div className="h-full w-full overflow-auto p-1 grid grid-cols-1 lg:grid-cols-3 gap-4 grid-rows-2">
      {/* Baris 1 */}
      <div className="lg:col-span-1">
        <StatusChart tasks={allTasks} />
      </div>
      <div className="lg:col-span-1">
        <BarChart title="Boards" data={boardChartData} legend={legend} />
      </div>
      <div className="lg:col-span-1">
        <BarChart title="Priority" data={priorityChartData} legend={legend} />
      </div>

      {/* Baris 2 - Anggota */}
      <div className="lg:col-span-3">
        <BarChart title="Members" data={memberChartData} legend={legend} />
      </div>
    </div>
  );
}
