"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "@/types";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

interface StatusChartProps {
  tasks: Task[];
}

// Helper function
const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// Tentukan warna tema di sini
const lightModeTextColor = "hsl(224, 7%, 10%)"; // Warna gelap (foreground light mode)
const darkModeTextColor = "hsl(0, 0%, 98%)"; // Warna terang (foreground dark mode)
const lightModeTrailColor = "rgba(0, 0, 0, 0.05)";
const darkModeTrailColor = "rgba(255, 255, 255, 0.1)";

export default function StatusChart({ tasks }: StatusChartProps) {
  const { resolvedTheme } = useTheme();
  const [trailColor, setTrailColor] = useState(lightModeTrailColor);
  const [textColor, setTextColor] = useState(lightModeTextColor);

  useEffect(() => {
    // Tentukan warna berdasarkan tema yang aktif
    if (resolvedTheme === "dark") {
      setTrailColor(darkModeTrailColor);
      setTextColor(darkModeTextColor);
    } else {
      setTrailColor(lightModeTrailColor);
      setTextColor(lightModeTextColor);
    }
  }, [resolvedTheme]);

  const totalTasks = tasks.length;
  const today = getToday();

  let notStarted = 0;
  let inProgress = 0;
  let completed = 0;
  let overdue = 0;

  tasks.forEach((task) => {
    const isOverdue =
      task.dueDate &&
      new Date(task.dueDate) < today &&
      task.progress !== "completed";

    if (isOverdue) {
      overdue++;
    } else if (task.progress === "completed") {
      completed++;
    } else if (task.progress === "in-progress") {
      inProgress++;
    } else {
      notStarted++;
    }
  });

  const remainingTasks = notStarted + inProgress + overdue;
  const percentage = totalTasks > 0 ? (completed / totalTasks) * 100 : 0;

  const stats = [
    { label: "Belum di...", value: notStarted, color: "bg-gray-400" },
    { label: "Dalam pr...", value: inProgress, color: "bg-blue-500" },
    { label: "Terlambat", value: overdue, color: "bg-red-500" },
    { label: "Selesai", value: completed, color: "bg-green-500" },
  ];

  return (
    <Card className="h-full bg-card/50">
      <CardHeader className="pb-0 pt-3">
        <CardTitle className="text-base font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md w-fit">
          Status
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row items-center gap-4 pt-4">
        <div className="w-32 h-32 flex-shrink-0">
          <CircularProgressbar
            value={percentage}
            text={`${remainingTasks}`}
            strokeWidth={10}
            styles={buildStyles({
              strokeLinecap: "butt",
              textSize: "24px",
              pathTransitionDuration: 0.5,
              pathColor: "hsl(var(--primary))",
              textColor: textColor,
              trailColor: trailColor,
            })}
          />
          <p className="text-center text-sm text-muted-foreground mt-1">
            Tugas tersisa
          </p>
        </div>
        <div className="flex-1 space-y-2 w-full">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex justify-between items-center text-sm"
            >
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${stat.color}`}></span>
                <span className="text-muted-foreground">{stat.label}</span>
              </div>
              <span className="font-semibold text-foreground">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
