"use client";

import { useMemo } from "react";
import { useProjects } from "@/contexts/projectContext";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventInput } from "@fullcalendar/core";
import type {
  EventDropArg,
  EventResizeDoneArg,
} from "@fullcalendar/interaction";
import { id as indonesianLocale } from "date-fns/locale";
import { addDays } from "date-fns";
import { cn } from "@/lib/utils";

export default function CalendarView() {
  const { selectedProject, editTask } = useProjects();
  const { resolvedTheme } = useTheme();

  const allTasks = useMemo(() => {
    return selectedProject?.boards.flatMap((board) => board.tasks) || [];
  }, [selectedProject]);

  const calendarEvents = useMemo(() => {
    return allTasks
      .filter((task) => task.startDate && task.dueDate)
      .map(
        (task): EventInput => ({
          id: task.id,
          title: task.title,
          start: new Date(task.startDate!),
          end: addDays(new Date(task.dueDate!), 1),
          allDay: true,
          classNames: [`task-progress-${task.progress}`],
        })
      );
  }, [allTasks]);

  const findTaskBoardId = (taskId: string): string | null => {
    if (!selectedProject) return null;
    for (const board of selectedProject.boards) {
      if (board.tasks.some((task) => task.id === taskId)) {
        return board.id;
      }
    }
    return null;
  };

  const handleTaskDrop = (dropInfo: EventDropArg) => {
    const { event } = dropInfo;
    const taskId = event.id;
    const boardId = findTaskBoardId(taskId);

    if (!boardId || !event.start || !event.end) return;

    const newStartDate = event.start;
    const newDueDate = addDays(event.end, -1);

    try {
      editTask(taskId, boardId, {
        startDate: newStartDate,
        dueDate: newDueDate,
      });
      toast.success(`Tugas "${event.title}" dipindahkan.`);
    } catch (error) {
      toast.error("Gagal memindahkan tugas." + (error as Error).message);
      dropInfo.revert();
    }
  };

  const handleTaskResize = (resizeInfo: EventResizeDoneArg) => {
    const { event } = resizeInfo;
    const taskId = event.id;
    const boardId = findTaskBoardId(taskId);

    if (!boardId || !event.start || !event.end) return;

    const newStartDate = event.start;
    const newDueDate = addDays(event.end, -1);

    try {
      editTask(taskId, boardId, {
        startDate: newStartDate,
        dueDate: newDueDate,
      });
      toast.success(`Durasi "${event.title}" diperbarui.`);
    } catch (error) {
      toast.error("Gagal mengubah durasi tugas." + (error as Error).message);
      resizeInfo.revert();
    }
  };

  return (
    <div
      className={cn(
        "calendar-view-container",
        resolvedTheme === "dark" && "dark"
      )}
    >
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={indonesianLocale}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth",
        }}
        events={calendarEvents}
        editable={true}
        selectable={true}
        eventResizableFromStart={true}
        droppable={true}
        eventDrop={handleTaskDrop}
        eventResize={handleTaskResize}
      />
    </div>
  );
}
