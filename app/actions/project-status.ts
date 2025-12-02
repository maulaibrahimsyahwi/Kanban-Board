"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProjectStatusesAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, data: [] };

  try {
    // Cek apakah user sudah punya status
    let statuses = await prisma.projectStatus.findMany({
      where: { userId: session.user.id },
      orderBy: { order: "asc" },
    });

    if (statuses.length === 0) {
      const defaults = [
        { name: "No status", color: "bg-slate-500", isSystem: true, order: 0 },
        { name: "On track", color: "bg-green-600", isSystem: false, order: 1 },
        { name: "At risk", color: "bg-amber-500", isSystem: false, order: 2 },
        { name: "Off track", color: "bg-red-600", isSystem: false, order: 3 },
      ];

      await prisma.projectStatus.createMany({
        data: defaults.map((s) => ({ ...s, userId: session.user.id })),
      });

      // Ambil ulang setelah dibuat
      statuses = await prisma.projectStatus.findMany({
        where: { userId: session.user.id },
        orderBy: { order: "asc" },
      });
    }

    return { success: true, data: statuses };
  } catch (error) {
    console.error("Get statuses error:", error);
    return { success: false, data: [] };
  }
}

export async function createProjectStatusAction(name: string, color: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    const lastStatus = await prisma.projectStatus.findFirst({
      where: { userId: session.user.id },
      orderBy: { order: "desc" },
    });
    const newOrder = lastStatus ? lastStatus.order + 1 : 0;

    const newStatus = await prisma.projectStatus.create({
      data: {
        name,
        color,
        userId: session.user.id,
        order: newOrder,
        isSystem: false,
      },
    });

    revalidatePath("/");
    return { success: true, data: newStatus };
  } catch {
    return { success: false, message: "Failed to create status" };
  }
}

export async function updateProjectStatusAction(
  id: string,
  data: { name?: string; color?: string }
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    await prisma.projectStatus.update({
      where: { id, userId: session.user.id },
      data,
    });
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, message: "Failed to update status" };
  }
}

export async function deleteProjectStatusAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    await prisma.projectStatus.delete({
      where: { id, userId: session.user.id },
    });
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, message: "Failed to delete status" };
  }
}

export async function setProjectStatusAction(
  projectId: string,
  statusId: string
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { statusId },
    });
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, message: "Failed to update project status" };
  }
}
