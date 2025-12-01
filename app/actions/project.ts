"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProjectAction(projectName: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const newProject = await prisma.project.create({
      data: {
        name: projectName,
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

    revalidatePath("/");
    return { success: true, data: newProject };
  } catch (error) {
    console.error("Create project error:", error);
    return { success: false, message: "Gagal membuat project" };
  }
}

export async function getProjectsAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, data: [] };

  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: session.user.id }, // Project milik sendiri
          { members: { some: { id: session.user.id } } }, // Project undangan
        ],
      },
      include: {
        owner: { select: { name: true, email: true, image: true } },
        members: { select: { name: true, email: true, image: true } },
        boards: {
          orderBy: { order: "asc" },
          include: {
            tasks: {
              include: { checklist: true, labels: true },
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

  try {
    await prisma.project.delete({
      where: { id: projectId, ownerId: session.user.id }, // Hanya owner yang bisa hapus
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete project error:", error);
    return { success: false, message: "Gagal menghapus project" };
  }
}

export async function updateProjectAction(
  projectId: string,
  data: { name?: string; icon?: string }
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    await prisma.project.update({
      where: { id: projectId, ownerId: session.user.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.icon && { icon: data.icon }),
      },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Update project error:", error);
    return { success: false, message: "Gagal mengupdate project" };
  }
}

export async function addMemberAction(projectId: string, email: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    const userInvited = await prisma.user.findUnique({
      where: { email },
    });

    if (!userInvited) {
      return {
        success: false,
        message:
          "User tidak ditemukan. Pastikan mereka sudah login ke aplikasi.",
      };
    }

    if (userInvited.id === session.user.id) {
      return {
        success: false,
        message: "Anda tidak bisa mengundang diri sendiri.",
      };
    }

    await prisma.project.update({
      where: {
        id: projectId,
        ownerId: session.user.id, // Hanya owner yang bisa invite
      },
      data: {
        members: {
          connect: { id: userInvited.id },
        },
      },
    });

    revalidatePath("/");
    return {
      success: true,
      message: `Berhasil mengundang ${userInvited.name || userInvited.email}`,
    };
  } catch (error) {
    console.error("Invite member error:", error);
    return { success: false, message: "Gagal mengundang user" };
  }
}
