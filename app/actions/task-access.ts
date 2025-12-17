import { prisma } from "@/lib/prisma";

export async function verifyProjectAccess(userId: string, boardId: string) {
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

export async function verifyTaskAccess(userId: string, taskId: string) {
  return prisma.task.findFirst({
    where: {
      id: taskId,
      board: {
        project: {
          OR: [{ ownerId: userId }, { members: { some: { id: userId } } }],
        },
      },
    },
    select: { id: true, boardId: true, order: true },
  });
}
