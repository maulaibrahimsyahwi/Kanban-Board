"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ensureTwoFactorUnlocked } from "@/lib/two-factor-session";
import { publishProjectInvalidation } from "@/lib/ably";
import { ProjectRole } from "@prisma/client";
import { canManageProject, getProjectAccessByProjectId } from "@/lib/project-permissions";

const RESOURCE_TYPES = ["per hour", "per item", "cost only"] as const;
const RESOURCE_COLORS = new Set([
  "bg-slate-500",
  "bg-red-500",
  "bg-orange-500",
  "bg-green-500",
  "bg-blue-500",
]);

const ResourceSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(50),
  color: z.string().trim().min(1),
  type: z.enum(RESOURCE_TYPES),
});

async function requireProjectAdmin(userId: string, projectId: string) {
  const access = await getProjectAccessByProjectId(userId, projectId);
  if (!access || !canManageProject(access.role)) return null;
  return access;
}

export async function createVirtualResourceAction(
  projectId: string,
  data: { name: string; color: string; type: string }
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, message: unlock.message };

  const validation = ResourceSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Invalid data",
    };
  }

  const { name, color, type } = validation.data;
  if (!RESOURCE_COLORS.has(color)) {
    return { success: false, message: "Invalid color selection." };
  }

  const project = await requireProjectAdmin(session.user.id, projectId);
  if (!project) return { success: false, message: "Forbidden" };

  try {
    const resource = await prisma.user.create({
      data: {
        name,
        isVirtual: true,
        resourceColor: color,
        resourceType: type,
        projectMemberships: {
          create: { projectId, role: ProjectRole.viewer },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isVirtual: true,
        resourceColor: true,
        resourceType: true,
      },
    });

    await publishProjectInvalidation({
      projectId,
      actorId: session.user.id,
      kind: "resource:create",
    });

    revalidatePath("/");
    return { success: true, data: resource };
  } catch (error) {
    console.error("Create resource error:", error);
    return { success: false, message: "Failed to create resource" };
  }
}

export async function deleteVirtualResourceAction(
  projectId: string,
  resourceId: string
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, message: unlock.message };

  const project = await requireProjectAdmin(session.user.id, projectId);
  if (!project) return { success: false, message: "Forbidden" };

  const resource = await prisma.user.findFirst({
    where: {
      id: resourceId,
      isVirtual: true,
      projectMemberships: { some: { projectId } },
    },
    select: { id: true },
  });

  if (!resource) {
    return { success: false, message: "Resource not found." };
  }

  try {
    await prisma.user.delete({ where: { id: resourceId } });

    await publishProjectInvalidation({
      projectId,
      actorId: session.user.id,
      kind: "resource:delete",
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete resource error:", error);
    return { success: false, message: "Failed to delete resource" };
  }
}

export async function convertVirtualResourceAction(args: {
  projectId: string;
  resourceId: string;
  targetUserId: string;
  deleteAfterConvert?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, message: unlock.message };

  const project = await requireProjectAdmin(session.user.id, args.projectId);
  if (!project) return { success: false, message: "Forbidden" };

  if (args.resourceId === args.targetUserId) {
    return { success: false, message: "Select a different target user." };
  }

  const [resource, targetUser, targetMembership] = await Promise.all([
    prisma.user.findFirst({
      where: {
        id: args.resourceId,
        isVirtual: true,
        projectMemberships: { some: { projectId: args.projectId } },
      },
      select: { id: true },
    }),
    prisma.user.findUnique({
      where: { id: args.targetUserId },
      select: { id: true, isVirtual: true },
    }),
    prisma.project.findFirst({
      where: {
        id: args.projectId,
        OR: [
          { ownerId: args.targetUserId },
          { members: { some: { userId: args.targetUserId } } },
        ],
      },
      select: { id: true },
    }),
  ]);

  if (!resource) {
    return { success: false, message: "Resource not found." };
  }

  if (!targetUser || targetUser.isVirtual || !targetMembership) {
    return { success: false, message: "Invalid target user." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const tasks = await tx.task.findMany({
        where: {
          board: { projectId: args.projectId },
          assignees: { some: { id: args.resourceId } },
        },
        select: { id: true, assignees: { select: { id: true } } },
      });

      for (const task of tasks) {
        const alreadyAssigned = task.assignees.some(
          (assignee) => assignee.id === args.targetUserId
        );
        await tx.task.update({
          where: { id: task.id },
          data: {
            assignees: {
              disconnect: { id: args.resourceId },
              ...(alreadyAssigned
                ? {}
                : { connect: { id: args.targetUserId } }),
            },
          },
        });
      }

      if (args.deleteAfterConvert) {
        await tx.user.delete({ where: { id: args.resourceId } });
      }
    });

    await publishProjectInvalidation({
      projectId: args.projectId,
      actorId: session.user.id,
      kind: "resource:convert",
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Convert resource error:", error);
    return { success: false, message: "Failed to convert resource" };
  }
}

export async function updateVirtualResourceTypeAction(args: {
  projectId: string;
  resourceId: string;
  type: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, message: unlock.message };

  const project = await requireProjectAdmin(session.user.id, args.projectId);
  if (!project) return { success: false, message: "Forbidden" };

  if (!RESOURCE_TYPES.includes(args.type as (typeof RESOURCE_TYPES)[number])) {
    return { success: false, message: "Invalid resource type." };
  }

  const resource = await prisma.user.findFirst({
    where: {
      id: args.resourceId,
      isVirtual: true,
      projectMemberships: { some: { projectId: args.projectId } },
    },
    select: { id: true },
  });

  if (!resource) {
    return { success: false, message: "Resource not found." };
  }

  try {
    await prisma.user.update({
      where: { id: args.resourceId },
      data: { resourceType: args.type },
    });

    await publishProjectInvalidation({
      projectId: args.projectId,
      actorId: session.user.id,
      kind: "resource:update",
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Update resource error:", error);
    return { success: false, message: "Failed to update resource" };
  }
}
