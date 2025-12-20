import { prisma } from "@/lib/prisma";
import { ProjectRole } from "@prisma/client";

export type ProjectAccessRole = ProjectRole | "owner";

const PROJECT_EDITOR_ROLES = new Set<ProjectAccessRole>([
  "owner",
  ProjectRole.admin,
  ProjectRole.editor,
]);

const PROJECT_ADMIN_ROLES = new Set<ProjectAccessRole>([
  "owner",
  ProjectRole.admin,
]);

function resolveRole(
  ownerId: string,
  userId: string,
  memberRole?: ProjectRole | null
) {
  if (ownerId === userId) return "owner" as const;
  if (memberRole) return memberRole;
  return null;
}

export function canEditProject(role: ProjectAccessRole) {
  return PROJECT_EDITOR_ROLES.has(role);
}

export function canManageProject(role: ProjectAccessRole) {
  return PROJECT_ADMIN_ROLES.has(role);
}

export async function getProjectAccessByProjectId(
  userId: string,
  projectId: string
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      ownerId: true,
      members: {
        where: { userId },
        select: { role: true },
        take: 1,
      },
    },
  });

  if (!project) return null;
  const role = resolveRole(project.ownerId, userId, project.members[0]?.role);
  if (!role) return null;
  return { projectId: project.id, role };
}

export async function getProjectAccessByBoardId(
  userId: string,
  boardId: string
) {
  const board = await prisma.board.findFirst({
    where: { id: boardId },
    select: {
      project: {
        select: {
          id: true,
          ownerId: true,
          members: {
            where: { userId },
            select: { role: true },
            take: 1,
          },
        },
      },
    },
  });

  if (!board?.project) return null;
  const role = resolveRole(
    board.project.ownerId,
    userId,
    board.project.members[0]?.role
  );
  if (!role) return null;
  return { projectId: board.project.id, role };
}

export async function getTaskAccessById(userId: string, taskId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId },
    select: {
      id: true,
      boardId: true,
      order: true,
      board: {
        select: {
          projectId: true,
          project: {
            select: {
              ownerId: true,
              members: {
                where: { userId },
                select: { role: true },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  if (!task) return null;
  const role = resolveRole(
    task.board.project.ownerId,
    userId,
    task.board.project.members[0]?.role
  );
  if (!role) return null;

  return {
    id: task.id,
    boardId: task.boardId,
    order: task.order,
    projectId: task.board.projectId,
    role,
  };
}
