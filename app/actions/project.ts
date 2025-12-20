"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ensureTwoFactorUnlocked } from "@/lib/two-factor-session";
import { publishProjectInvalidation } from "@/lib/ably";
import { ProjectRole } from "@prisma/client";
import { canManageProject, getProjectAccessByProjectId } from "@/lib/project-permissions";

export async function createProjectAction(projectName: string, icon?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, message: unlock.message };

  try {
    const newProject = await prisma.project.create({
      data: {
        name: projectName,
        icon: icon || "FaDiagramProject",
        ownerId: session.user.id,
        boards: {
          create: [
            { name: "To Do", order: 0 },
            { name: "In Progress", order: 1 },
            { name: "Done", order: 2 },
          ],
        },
      },
      include: {
        boards: { include: { tasks: true } },
      },
    });

    await publishProjectInvalidation({
      projectId: newProject.id,
      actorId: session.user.id,
      kind: "project:create",
    });

    revalidatePath("/");
    return { success: true, data: newProject };
  } catch (error) {
    console.error("Create project error:", error);
    return { success: false, message: "Failed to create project" };
  }
}

export async function getProjectsAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, data: [] };

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, data: [], message: unlock.message };

  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          { members: { some: { userId: session.user.id } } },
        ],
      },
      include: {
        owner: {
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
        members: {
          select: {
            role: true,
            user: {
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
          },
        },
        status: true,
        boards: {
          orderBy: { order: "asc" },
          include: {
            tasks: {
              include: {
                checklist: true,
                labels: true,
                attachments: true,
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
              },
              orderBy: { order: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: projects };
  } catch (error) {
    console.error("Get projects error:", error);
    return { success: false, data: [] };
  }
}

export async function deleteProjectAction(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, message: unlock.message };

  try {
    const access = await getProjectAccessByProjectId(session.user.id, projectId);
    if (!access || access.role !== "owner") {
      return { success: false, message: "Forbidden" };
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    await publishProjectInvalidation({
      projectId,
      actorId: session.user.id,
      kind: "project:delete",
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete project error:", error);
    return { success: false, message: "Failed to delete project" };
  }
}

export async function updateProjectAction(
  projectId: string,
  data: { name?: string; icon?: string }
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, message: unlock.message };

  try {
    const access = await getProjectAccessByProjectId(session.user.id, projectId);
    if (!access || !canManageProject(access.role)) {
      return { success: false, message: "Forbidden" };
    }

    await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.icon && { icon: data.icon }),
      },
    });

    await publishProjectInvalidation({
      projectId,
      actorId: session.user.id,
      kind: "project:update",
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Update project error:", error);
    return { success: false, message: "Failed to update project" };
  }
}

export async function addMemberAction(
  projectId: string,
  email: string,
  role: ProjectRole = ProjectRole.editor
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, message: unlock.message };

  try {
    const access = await getProjectAccessByProjectId(session.user.id, projectId);
    if (!access || !canManageProject(access.role)) {
      return { success: false, message: "Forbidden" };
    }

    const normalizedRole = Object.values(ProjectRole).includes(
      role as ProjectRole
    )
      ? (role as ProjectRole)
      : ProjectRole.editor;

    const userInvited = await prisma.user.findUnique({
      where: { email },
    });

    if (!userInvited) {
      return {
        success: false,
        message:
          "User not found. Make sure they've signed in to the app.",
      };
    }

    if (userInvited.id === session.user.id) {
      return {
        success: false,
        message: "You can't invite yourself.",
      };
    }

    const existingMembership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: userInvited.id } },
      select: { projectId: true },
    });

    if (existingMembership) {
      return {
        success: false,
        message: "User is already a member of this project.",
      };
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });

    if (!project) {
      return { success: false, message: "Project not found." };
    }

    if (project.ownerId === userInvited.id) {
      return {
        success: false,
        message: "User is already the project owner.",
      };
    }

    await prisma.projectMember.create({
      data: {
        projectId,
        userId: userInvited.id,
        role: normalizedRole,
      },
    });

    await publishProjectInvalidation({
      projectId,
      actorId: session.user.id,
      kind: "project:member:add",
    });

    revalidatePath("/");
    return {
      success: true,
      message: `Successfully invited ${userInvited.name || userInvited.email}`,
    };
  } catch (error) {
    console.error("Invite member error:", error);
    return { success: false, message: "Failed to invite user" };
  }
}

export async function transferProjectOwnershipAction(
  projectId: string,
  newOwnerId: string
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, message: unlock.message };

  const trimmedProjectId = projectId.trim();
  const trimmedOwnerId = newOwnerId.trim();
  if (!trimmedProjectId || !trimmedOwnerId) {
    return { success: false, message: "Invalid project or owner." };
  }

  if (trimmedOwnerId === session.user.id) {
    return { success: false, message: "Selected user is already the owner." };
  }

  const project = await prisma.project.findUnique({
    where: { id: trimmedProjectId },
    select: { id: true, ownerId: true },
  });

  if (!project || project.ownerId !== session.user.id) {
    return { success: false, message: "Forbidden" };
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: trimmedOwnerId },
    select: { id: true, isVirtual: true },
  });

  if (!targetUser || targetUser.isVirtual) {
    return { success: false, message: "Invalid new owner." };
  }

  const isMember = await prisma.project.findFirst({
    where: {
      id: trimmedProjectId,
      members: { some: { userId: trimmedOwnerId } },
    },
    select: { id: true },
  });

  if (!isMember) {
    return {
      success: false,
      message: "New owner must be a project member.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.project.update({
        where: { id: trimmedProjectId },
        data: {
          ownerId: trimmedOwnerId,
        },
      });

      await tx.projectMember.upsert({
        where: {
          projectId_userId: { projectId: trimmedProjectId, userId: session.user.id },
        },
        update: { role: ProjectRole.admin },
        create: {
          projectId: trimmedProjectId,
          userId: session.user.id,
          role: ProjectRole.admin,
        },
      });

      await tx.projectMember.deleteMany({
        where: {
          projectId: trimmedProjectId,
          userId: trimmedOwnerId,
        },
      });
    });

    await publishProjectInvalidation({
      projectId: trimmedProjectId,
      actorId: session.user.id,
      kind: "project:owner:transfer",
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Transfer owner error:", error);
    return { success: false, message: "Failed to transfer ownership" };
  }
}
