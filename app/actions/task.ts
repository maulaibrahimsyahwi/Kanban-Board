"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Task } from "@/types";

export async function createTaskAction(
  boardId: string,
  taskData: Partial<Task>
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    const lastTask = await prisma.task.findFirst({
      where: { boardId },
      orderBy: { order: "desc" },
    });
    const newOrder = lastTask ? lastTask.order + 1 : 0;

    const newTask = await prisma.task.create({
      data: {
        title: taskData.title!,
        description: taskData.description,
        priority: taskData.priority || "low",
        progress: taskData.progress || "not-started",
        startDate: taskData.startDate,
        dueDate: taskData.dueDate,
        cardDisplayPreference: taskData.cardDisplayPreference || "none",
        boardId: boardId,
        order: newOrder,
        labels: {
          create: taskData.labels?.map((l) => ({
            name: l.name,
            color: l.color,
          })),
        },
        checklist: {
          create: taskData.checklist?.map((c) => ({
            text: c.text,
            isDone: c.isDone,
          })),
        },
      },
      include: {
        labels: true,
        checklist: true,
        assignees: { select: { name: true, email: true, image: true } },
        attachments: true,
      },
    });

    revalidatePath("/");
    return { success: true, data: newTask };
  } catch (error) {
    console.error("Create task error:", error);
    return { success: false, message: "Gagal membuat task" };
  }
}

export async function updateTaskAction(taskId: string, updates: Partial<Task>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    const { labels, checklist, assignees, attachments, ...primitiveData } =
      updates;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...primitiveData,
        ...(labels && {
          labels: {
            deleteMany: {},
            create: labels.map((l) => ({ name: l.name, color: l.color })),
          },
        }),
        ...(checklist && {
          checklist: {
            deleteMany: {},
            create: checklist.map((c) => ({ text: c.text, isDone: c.isDone })),
          },
        }),
        ...(assignees && {
          assignees: {
            set: [],
            connect: assignees
              .filter((u) => u.email)
              .map((u) => ({ email: u.email! })),
          },
        }),
        ...(attachments && {
          attachments: {
            deleteMany: {},
            create: attachments.map((a) => ({
              name: a.name,
              url: a.url,
              type: a.type,
            })),
          },
        }),
      },
      include: {
        labels: true,
        checklist: true,
        assignees: { select: { name: true, email: true, image: true } },
        attachments: true,
      },
    });

    revalidatePath("/");
    return { success: true, data: updatedTask };
  } catch (error) {
    console.error("Update task error:", error);
    return { success: false, message: "Gagal update task" };
  }
}

export async function moveTaskAction(
  taskId: string,
  newBoardId: string,
  newOrder: number
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    await prisma.task.update({
      where: { id: taskId },
      data: {
        boardId: newBoardId,
        order: newOrder,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Gagal memindahkan task" };
  }
}

export async function deleteTaskAction(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    await prisma.task.delete({ where: { id: taskId } });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Gagal menghapus task" };
  }
}
