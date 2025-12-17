"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ensureTwoFactorUnlocked } from "@/lib/two-factor-session";
import { publishProjectInvalidation } from "@/lib/ably";

async function verifyProjectAccess(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [{ ownerId: userId }, { members: { some: { id: userId } } }],
    },
    select: { id: true },
  });

  return !!project;
}

async function verifyBoardAccess(userId: string, boardId: string) {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      project: {
        OR: [{ ownerId: userId }, { members: { some: { id: userId } } }],
      },
    },
    select: { id: true },
  });

  return !!board;
}

export async function createBoardAction(projectId: string, name: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, message: unlock.message };

  const hasAccess = await verifyProjectAccess(session.user.id, projectId);
  if (!hasAccess) return { success: false, message: "Forbidden" };

  try {
    const lastBoard = await prisma.board.findFirst({
      where: { projectId },
      orderBy: { order: "desc" },
    });
    const newOrder = lastBoard ? lastBoard.order + 1 : 0;

    const newBoard = await prisma.board.create({
      data: {
        name,
        projectId,
        order: newOrder,
      },
      include: { tasks: true },
    });

    await publishProjectInvalidation({
      projectId,
      actorId: session.user.id,
      kind: "board:create",
    });

    revalidatePath("/");
    return { success: true, data: newBoard };
  } catch (error) {
    return { success: false, message: "Gagal membuat board" };
  }
}

export async function deleteBoardAction(boardId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, message: unlock.message };

  const hasAccess = await verifyBoardAccess(session.user.id, boardId);
  if (!hasAccess) return { success: false, message: "Forbidden" };

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
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Gagal menghapus board" };
  }
}

export async function updateBoardAction(boardId: string, name: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, message: unlock.message };

  const hasAccess = await verifyBoardAccess(session.user.id, boardId);
  if (!hasAccess) return { success: false, message: "Forbidden" };

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

    revalidatePath("/");
    return { success: true, data: updatedBoard };
  } catch (error) {
    return { success: false, message: "Gagal update board" };
  }
}
