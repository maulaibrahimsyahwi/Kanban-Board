"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Task } from "@/types";
import { verifyProjectAccess, verifyTaskAccess } from "./task-access";
import { TaskUpdateSchema } from "./task-schemas";

export async function createTaskAction(
  boardId: string,
  taskData: Partial<Task>
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const hasAccess = await verifyProjectAccess(session.user.id, boardId);
  if (!hasAccess) {
    return {
      success: false,
      message: "Forbidden: You do not have access to this project.",
    };
  }

  if (!taskData.title || taskData.title.trim().length === 0) {
    return { success: false, message: "Title is required" };
  }

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
        progress: taskData.progress || "not_started",
        statusId: taskData.statusId,
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

  const existingTask = await verifyTaskAccess(session.user.id, taskId);
  if (!existingTask) {
    return { success: false, message: "Forbidden or Task not found." };
  }

  const validation = TaskUpdateSchema.safeParse(updates);
  if (!validation.success) {
    return { success: false, message: "Invalid data format" };
  }

  try {
    const {
      labels,
      checklist,
      assignees,
      attachments,
      statusId,
      ...primitiveData
    } = validation.data;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...primitiveData,
        ...(statusId !== undefined && {
          status: statusId
            ? { connect: { id: statusId } }
            : { disconnect: true },
        }),
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
              .filter(
                (u): u is { email: string } =>
                  typeof u === "object" &&
                  u !== null &&
                  "email" in u &&
                  typeof u.email === "string"
              )
              .map((u) => ({ email: u.email })),
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
  newIndex: number
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const task = await verifyTaskAccess(session.user.id, taskId);
  if (!task) return { success: false, message: "Forbidden or Task not found." };

  const targetBoardAccess = await verifyProjectAccess(
    session.user.id,
    newBoardId
  );
  if (!targetBoardAccess) {
    return {
      success: false,
      message: "Forbidden: Cannot move task to this board.",
    };
  }

  const oldBoardId = task.boardId;

  try {
    await prisma.$transaction(async (tx) => {
      // Catatan penting: client mengirim `destination.index` (index di UI), bukan nilai `order` yang pasti rapat.
      // Karena `order` bisa memiliki gap (mis. setelah delete), kita perlakukan parameter ini sebagai "index tujuan"
      // lalu normalisasi ulang `order` agar rapat (0..n-1) supaya UI tidak "mantul" saat data di-refresh.
      const [sourceTasks, destinationTasks] = await Promise.all([
        tx.task.findMany({
          where: { boardId: oldBoardId },
          orderBy: { order: "asc" },
          select: { id: true },
        }),
        oldBoardId === newBoardId
          ? Promise.resolve([] as { id: string }[])
          : tx.task.findMany({
              where: { boardId: newBoardId },
              orderBy: { order: "asc" },
              select: { id: true },
            }),
      ]);

      const sourceIds = sourceTasks
        .map((t) => t.id)
        .filter((id) => id !== taskId);

      if (oldBoardId === newBoardId) {
        const nextIds = [...sourceIds];
        const clampedIndex = Math.max(
          0,
          Math.min(
            Number.isFinite(newIndex) ? Math.trunc(newIndex) : 0,
            nextIds.length
          )
        );
        nextIds.splice(clampedIndex, 0, taskId);

        await Promise.all(
          nextIds.map((id, index) =>
            tx.task.update({ where: { id }, data: { order: index } })
          )
        );
        return;
      }

      const destIdsOriginal = destinationTasks
        .map((t) => t.id)
        .filter((id) => id !== taskId);
      const clampedIndex = Math.max(
        0,
        Math.min(
          Number.isFinite(newIndex) ? Math.trunc(newIndex) : 0,
          destIdsOriginal.length
        )
      );
      const destIds = [...destIdsOriginal];
      destIds.splice(clampedIndex, 0, taskId);

      await Promise.all([
        ...sourceIds.map((id, index) =>
          tx.task.update({ where: { id }, data: { order: index } })
        ),
        ...destIds.map((id, index) =>
          tx.task.update({
            where: { id },
            data:
              id === taskId
                ? { boardId: newBoardId, order: index }
                : { order: index },
          })
        ),
      ]);
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Move task error:", error);
    return { success: false, message: "Gagal memindahkan task" };
  }
}

export async function deleteTaskAction(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const existingTask = await verifyTaskAccess(session.user.id, taskId);
  if (!existingTask) {
    return { success: false, message: "Forbidden or Task not found." };
  }

  try {
    // Jaga `order` tetap rapat setelah delete agar drag/drop berbasis index tetap konsisten.
    await prisma.$transaction(async (tx) => {
      await tx.task.delete({ where: { id: taskId } });
      await tx.task.updateMany({
        where: {
          boardId: existingTask.boardId,
          order: { gt: existingTask.order },
        },
        data: { order: { decrement: 1 } },
      });
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Gagal menghapus task" };
  }
}
