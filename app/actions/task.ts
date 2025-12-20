"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Task } from "@/types";
import { TaskUpdateSchema } from "./task-schemas";
import { ensureTwoFactorUnlocked } from "@/lib/two-factor-session";
import { publishProjectInvalidation } from "@/lib/ably";
import { ActivityAction, ActivityEntityType } from "@prisma/client";
import { recordActivity } from "@/lib/activity-log";
import {
  canEditProject,
  getProjectAccessByBoardId,
  getTaskAccessById,
} from "@/lib/project-permissions";
import { computeOrderBetween } from "@/lib/order-utils";

export async function createTaskAction(
  boardId: string,
  taskData: Partial<Task>
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, message: unlock.message };

  const access = await getProjectAccessByBoardId(session.user.id, boardId);
  if (!access || !canEditProject(access.role)) {
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

    if (access.projectId) {
      await publishProjectInvalidation({
        projectId: access.projectId,
        actorId: session.user.id,
        kind: "task:create",
      });

      await recordActivity({
        projectId: access.projectId,
        actorId: session.user.id,
        action: ActivityAction.create,
        entityType: ActivityEntityType.task,
        entityId: newTask.id,
        metadata: { boardId },
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

  const existingTask = await getTaskAccessById(session.user.id, taskId);
  if (!existingTask) {
    return { success: false, message: "Forbidden or Task not found." };
  }
  if (!canEditProject(existingTask.role)) {
    return { success: false, message: "Forbidden" };
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

    const project = await prisma.project.findUnique({
      where: { id: existingTask.projectId },
      select: {
        owner: { select: { id: true, email: true } },
        members: {
          select: { user: { select: { id: true, email: true } } },
        },
      },
    });

    if (!project) {
      return { success: false, message: "Forbidden or Task not found." };
    }

    const allowedUsers = [
      project.owner,
      ...project.members.map((member) => member.user),
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

    if (existingTask.projectId) {
      await publishProjectInvalidation({
        projectId: existingTask.projectId,
        actorId: session.user.id,
        kind: "task:update",
      });

      await recordActivity({
        projectId: existingTask.projectId,
        actorId: session.user.id,
        action: ActivityAction.update,
        entityType: ActivityEntityType.task,
        entityId: taskId,
        metadata: { boardId: existingTask.boardId },
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

  const taskAccess = await getTaskAccessById(session.user.id, taskId);
  if (!taskAccess) {
    return { success: false, message: "Forbidden or Task not found." };
  }
  if (!canEditProject(taskAccess.role)) {
    return { success: false, message: "Forbidden" };
  }

  const targetAccess = await getProjectAccessByBoardId(
    session.user.id,
    newBoardId
  );
  if (!targetAccess || !canEditProject(targetAccess.role)) {
    return {
      success: false,
      message: "Forbidden: Cannot move task to this board.",
    };
  }

  const oldBoardId = taskAccess.boardId;

  try {
    await prisma.$transaction(async (tx) => {
      const destinationTasks = await tx.task.findMany({
        where: { boardId: newBoardId },
        orderBy: { order: "asc" },
        select: { id: true, order: true },
      });

      const filtered = destinationTasks.filter((task) => task.id !== taskId);
      const targetIndex = Number.isFinite(newIndex)
        ? Math.trunc(newIndex)
        : filtered.length;
      const clampedIndex = Math.max(0, Math.min(targetIndex, filtered.length));

      const prevOrder =
        clampedIndex === 0 ? null : filtered[clampedIndex - 1]?.order;
      const nextOrder =
        clampedIndex === filtered.length ? null : filtered[clampedIndex]?.order;

      const nextOrderValue = computeOrderBetween(prevOrder, nextOrder);

      await tx.task.update({
        where: { id: taskId },
        data: { boardId: newBoardId, order: nextOrderValue },
      });
    });

    const projectIds = new Set<string>([
      taskAccess.projectId,
      targetAccess.projectId,
    ]);

    await Promise.all(
      [...projectIds].map((projectId) =>
        publishProjectInvalidation({
          projectId,
          actorId: session.user.id,
          kind: "task:move",
        })
      )
    );

    await recordActivity({
      projectId: targetAccess.projectId,
      actorId: session.user.id,
      action: ActivityAction.move,
      entityType: ActivityEntityType.task,
      entityId: taskId,
      metadata: {
        fromBoardId: oldBoardId,
        toBoardId: newBoardId,
        fromProjectId: taskAccess.projectId,
        toProjectId: targetAccess.projectId,
      },
    });

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

  const existingTask = await getTaskAccessById(session.user.id, taskId);
  if (!existingTask) {
    return { success: false, message: "Forbidden or Task not found." };
  }
  if (!canEditProject(existingTask.role)) {
    return { success: false, message: "Forbidden" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.task.delete({ where: { id: taskId } });
    });

    await publishProjectInvalidation({
      projectId: existingTask.projectId,
      actorId: session.user.id,
      kind: "task:delete",
    });

    await recordActivity({
      projectId: existingTask.projectId,
      actorId: session.user.id,
      action: ActivityAction.delete,
      entityType: ActivityEntityType.task,
      entityId: taskId,
      metadata: { boardId: existingTask.boardId },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Failed to delete task" };
  }
}
