"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Task } from "@/types";
import { verifyProjectAccess, verifyTaskAccess } from "./task-access";
import { TaskUpdateSchema } from "./task-schemas";
import { ensureTwoFactorUnlocked } from "@/lib/two-factor-session";
import { publishProjectInvalidation } from "@/lib/ably";

export async function createTaskAction(
  boardId: string,
  taskData: Partial<Task>
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, message: unlock.message };

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
    const newTask = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Board" WHERE id = ${boardId} FOR UPDATE`;

      const lastTask = await tx.task.findFirst({
        where: { boardId },
        orderBy: { order: "desc" },
      });
      const newOrder = lastTask ? lastTask.order + 1 : 0;

      return tx.task.create({
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
          assignees: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              isVirtual: true,
              resourceColor: true,
              resourceType: true,
            },
          },
          attachments: true,
        },
      });
    });

    const board = await prisma.board.findUnique({
      where: { id: boardId },
      select: { projectId: true },
    });

    if (board?.projectId) {
      await publishProjectInvalidation({
        projectId: board.projectId,
        actorId: session.user.id,
        kind: "task:create",
      });
    }

    revalidatePath("/");
    return { success: true, data: newTask };
  } catch (error) {
    console.error("Create task error:", error);
    return { success: false, message: "Failed to create task" };
  }
}

export async function updateTaskAction(taskId: string, updates: Partial<Task>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, message: unlock.message };

  const existingTask = await verifyTaskAccess(session.user.id, taskId);
  if (!existingTask) {
    return { success: false, message: "Forbidden or Task not found." };
  }

  const validation = TaskUpdateSchema.safeParse(updates);
  if (!validation.success) {
    return { success: false, message: "Invalid data format" };
  }

  const assigneeInput = validation.data.assignees;
  let assigneeConnections: Array<{ id: string }> | undefined;

  if (assigneeInput !== undefined) {
    const rawAssignees = Array.isArray(assigneeInput) ? assigneeInput : [];
    const normalizedAssignees = rawAssignees.map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const candidate = entry as { id?: unknown; email?: unknown };
      const id = typeof candidate.id === "string" ? candidate.id.trim() : "";
      if (id) return { id };
      const email =
        typeof candidate.email === "string"
          ? candidate.email.trim().toLowerCase()
          : "";
      if (email) return { email };
      return null;
    });

    if (normalizedAssignees.some((entry) => !entry)) {
      return { success: false, message: "Invalid assignee data." };
    }

    const boardProject = await prisma.board.findUnique({
      where: { id: existingTask.boardId },
      select: {
        project: {
          select: {
            owner: { select: { id: true, email: true } },
            members: { select: { id: true, email: true } },
          },
        },
      },
    });

    if (!boardProject?.project) {
      return { success: false, message: "Forbidden or Task not found." };
    }

    const allowedUsers = [
      boardProject.project.owner,
      ...boardProject.project.members,
    ];
    const allowedIds = new Set(allowedUsers.map((user) => user.id));
    const emailToId = new Map(
      allowedUsers
        .filter((user) => user.email)
        .map((user) => [user.email!.toLowerCase(), user.id])
    );

    const deduped = new Map<string, { id: string }>();
    for (const entry of normalizedAssignees) {
      if (!entry) continue;
      const id = "id" in entry ? entry.id : emailToId.get(entry.email);
      if (!id || !allowedIds.has(id)) {
        return {
          success: false,
          message: "Assignees must be project members.",
        };
      }
      deduped.set(id, { id });
    }

    assigneeConnections = [...deduped.values()];
  }

  try {
    const {
      labels,
      checklist,
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
        ...(assigneeInput !== undefined && {
          assignees: {
            set: [],
            connect: assigneeConnections ?? [],
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
        assignees: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isVirtual: true,
            resourceColor: true,
            resourceType: true,
          },
        },
        attachments: true,
      },
    });

    const board = await prisma.board.findUnique({
      where: { id: updatedTask.boardId },
      select: { projectId: true },
    });

    if (board?.projectId) {
      await publishProjectInvalidation({
        projectId: board.projectId,
        actorId: session.user.id,
        kind: "task:update",
      });
    }

    revalidatePath("/");
    return { success: true, data: updatedTask };
  } catch (error) {
    console.error("Update task error:", error);
    return { success: false, message: "Failed to update task" };
  }
}

export async function moveTaskAction(
  taskId: string,
  newBoardId: string,
  newIndex: number
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, message: unlock.message };

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
  const [oldBoard, newBoard] = await Promise.all([
    prisma.board.findUnique({
      where: { id: oldBoardId },
      select: { projectId: true },
    }),
    prisma.board.findUnique({
      where: { id: newBoardId },
      select: { projectId: true },
    }),
  ]);

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

    const projectIds = new Set<string>();
    if (oldBoard?.projectId) projectIds.add(oldBoard.projectId);
    if (newBoard?.projectId) projectIds.add(newBoard.projectId);

    await Promise.all(
      [...projectIds].map((projectId) =>
        publishProjectInvalidation({
          projectId,
          actorId: session.user.id,
          kind: "task:move",
        })
      )
    );

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Move task error:", error);
    return { success: false, message: "Failed to move task" };
  }
}

export async function deleteTaskAction(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, message: unlock.message };

  const existingTask = await verifyTaskAccess(session.user.id, taskId);
  if (!existingTask) {
    return { success: false, message: "Forbidden or Task not found." };
  }

  const board = await prisma.board.findUnique({
    where: { id: existingTask.boardId },
    select: { projectId: true },
  });

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

    if (board?.projectId) {
      await publishProjectInvalidation({
        projectId: board.projectId,
        actorId: session.user.id,
        kind: "task:delete",
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Failed to delete task" };
  }
}
