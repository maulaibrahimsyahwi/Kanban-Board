"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ensureTwoFactorUnlocked } from "@/lib/two-factor-session";
import { publishProjectInvalidation } from "@/lib/ably";
import { ActivityAction, ActivityEntityType } from "@prisma/client";
import { recordActivity } from "@/lib/activity-log";
import {
  canEditProject,
  canManageProject,
  getProjectAccessByBoardId,
  getProjectAccessByProjectId,
} from "@/lib/project-permissions";

export async function createBoardAction(projectId: string, name: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, message: unlock.message };

  const access = await getProjectAccessByProjectId(session.user.id, projectId);
  if (!access || !canEditProject(access.role)) {
    return { success: false, message: "Forbidden" };
  }

  try {
    const newBoard = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Project" WHERE id = ${projectId} FOR UPDATE`;

      const lastBoard = await tx.board.findFirst({
        where: { projectId },
        orderBy: { order: "desc" },
      });
      const newOrder = lastBoard ? lastBoard.order + 1 : 0;

      return tx.board.create({
        data: {
          name,
          projectId,
          order: newOrder,
        },
        include: { tasks: true },
      });
    });

    await publishProjectInvalidation({
      projectId,
      actorId: session.user.id,
      kind: "board:create",
    });

    await recordActivity({
      projectId,
      actorId: session.user.id,
      action: ActivityAction.create,
      entityType: ActivityEntityType.board,
      entityId: newBoard.id,
      metadata: { order: newBoard.order },
    });

    revalidatePath("/");
    return { success: true, data: newBoard };
  } catch (error) {
    return { success: false, message: "Failed to create board" };
  }
}

export async function deleteBoardAction(boardId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, message: unlock.message };

  const access = await getProjectAccessByBoardId(session.user.id, boardId);
  if (!access || !canManageProject(access.role)) {
    return { success: false, message: "Forbidden" };
  }

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { projectId: true },
  });

  try {
    await prisma.board.delete({
      where: { id: boardId },
    });

    if (board?.projectId) {
      await publishProjectInvalidation({
        projectId: board.projectId,
        actorId: session.user.id,
        kind: "board:delete",
      });

      await recordActivity({
        projectId: board.projectId,
        actorId: session.user.id,
        action: ActivityAction.delete,
        entityType: ActivityEntityType.board,
        entityId: boardId,
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Failed to delete board" };
  }
}

export async function updateBoardAction(boardId: string, name: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, message: unlock.message };

  const access = await getProjectAccessByBoardId(session.user.id, boardId);
  if (!access || !canEditProject(access.role)) {
    return { success: false, message: "Forbidden" };
  }

  try {
    const updatedBoard = await prisma.board.update({
      where: { id: boardId },
      data: { name },
    });

    await publishProjectInvalidation({
      projectId: updatedBoard.projectId,
      actorId: session.user.id,
      kind: "board:update",
    });

    await recordActivity({
      projectId: updatedBoard.projectId,
      actorId: session.user.id,
      action: ActivityAction.update,
      entityType: ActivityEntityType.board,
      entityId: updatedBoard.id,
    });

    revalidatePath("/");
    return { success: true, data: updatedBoard };
  } catch (error) {
    return { success: false, message: "Failed to update board" };
  }
}
