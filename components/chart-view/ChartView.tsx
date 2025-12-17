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
  { label: "Belum Dimulai", color: stackColors.notStarted },
  { label: "Dalam Proses", color: stackColors.inProgress },
  { label: "Terlambat", color: stackColors.overdue },
  { label: "Selesai", color: stackColors.completed },
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
      label: "Belum Dimulai",
    },
    { value: inProgress, color: stackColors.inProgress, label: "Dalam Proses" },
    { value: overdue, color: stackColors.overdue, label: "Terlambat" },
    { value: completed, color: stackColors.completed, label: "Selesai" },
  ];
};

export default function ChartView() {
  const { selectedProject } = useProjects();

  if (!selectedProject) {
    return (
      <div className="text-muted-foreground">
        Pilih proyek untuk melihat bagan.
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
      label: "Mendesak",
      stacks: getTaskStacks(allTasks.filter((t) => t.priority === "critical")),
    },
    {
      label: "Penting",
      stacks: getTaskStacks(allTasks.filter((t) => t.priority === "high")),
    },
    {
      label: "Sedang",
      stacks: getTaskStacks(allTasks.filter((t) => t.priority === "medium")),
    },
    {
      label: "Rendah",
      stacks: getTaskStacks(allTasks.filter((t) => t.priority === "low")),
    },
  ];

  // Data untuk Bagan "Anggota" (Members)
  const allMembers = [selectedProject.owner, ...selectedProject.members];

  const memberChartData: BarChartData[] = [
    { label: "Tidak Ditet.", stacks: getTaskStacks(allTasks) },
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
        <BarChart title="Wadah" data={boardChartData} legend={legend} />
      </div>
      <div className="lg:col-span-1">
        <BarChart title="Prioritas" data={priorityChartData} legend={legend} />
      </div>

      {/* Baris 2 - Anggota */}
      <div className="lg:col-span-3">
        <BarChart title="Anggota" data={memberChartData} legend={legend} />
      </div>
    </div>
  );
}
