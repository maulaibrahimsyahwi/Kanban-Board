import { prisma } from "@/lib/prisma";

export async function verifyProjectAccess(userId: string, boardId: string) {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      project: {
        include: {
          members: { select: { id: true } },
        },
      },
    },
  });

  if (!board) return false;

  const isOwner = board.project.ownerId === userId;
  const isMember = board.project.members.some((member) => member.id === userId);

  return isOwner || isMember;
}

export async function verifyTaskAccess(userId: string, taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      board: {
        include: {
          project: {
            include: {
              members: { select: { id: true } },
            },
          },
        },
      },
    },
  });

  if (!task) return null;

  const isOwner = task.board.project.ownerId === userId;
  const isMember = task.board.project.members.some((member) => member.id === userId);

  if (!isOwner && !isMember) return null;

  return task;
}

