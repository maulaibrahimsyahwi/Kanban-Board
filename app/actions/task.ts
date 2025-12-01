"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Task } from "@/types";

// Helper untuk memastikan user yang login adalah pemilik task/project
// (Bisa ditambahkan nanti untuk keamanan lebih ketat)

export async function createTaskAction(
  boardId: string,
  taskData: Partial<Task>
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    // Hitung order: taruh di paling bawah list
    const lastTask = await prisma.task.findFirst({
      where: { boardId },
      orderBy: { order: "desc" },
    });
    const newOrder = lastTask ? lastTask.order + 1 : 0;

    const newTask = await prisma.task.create({
      data: {
        title: taskData.title!,
        description: taskData.description,
        priority: taskData.priority || "low",
        progress: taskData.progress || "not-started",
        startDate: taskData.startDate,
        dueDate: taskData.dueDate,
        cardDisplayPreference: taskData.cardDisplayPreference || "none",
        boardId: boardId,
        order: newOrder,
        // Simpan labels jika ada
        labels: {
          create: taskData.labels?.map((l) => ({
            name: l.name,
            color: l.color,
          })),
        },
        // Simpan checklist jika ada
        checklist: {
          create: taskData.checklist?.map((c) => ({
            text: c.text,
            isDone: c.isDone,
          })),
        },
      },
      include: { labels: true, checklist: true },
    });

    revalidatePath("/");
    return { success: true, data: newTask };
  } catch (error) {
    console.error("Create task error:", error);
    return { success: false, message: "Gagal membuat task" };
  }
}

export async function updateTaskAction(taskId: string, updates: Partial<Task>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    // Kita pisahkan data relasi (labels/checklist) dari data biasa
    const { labels, checklist, ...primitiveData } = updates;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...primitiveData,
        // Update labels (Hapus semua lama, buat baru - strategi simpel)
        ...(labels && {
          labels: {
            deleteMany: {},
            create: labels.map((l) => ({ name: l.name, color: l.color })),
          },
        }),
        // Update checklist
        ...(checklist && {
          checklist: {
            deleteMany: {},
            create: checklist.map((c) => ({ text: c.text, isDone: c.isDone })),
          },
        }),
      },
      include: { labels: true, checklist: true },
    });

    revalidatePath("/");
    return { success: true, data: updatedTask };
  } catch (error) {
    console.error("Update task error:", error);
    return { success: false, message: "Gagal update task" };
  }
}

export async function moveTaskAction(
  taskId: string,
  newBoardId: string,
  newOrder: number
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    // 1. Pindahkan task ke board baru & update ordernya
    await prisma.task.update({
      where: { id: taskId },
      data: {
        boardId: newBoardId,
        order: newOrder,
      },
    });

    // 2. (Opsional tapi bagus) Re-index order task lain di board tujuan
    // agar urutannya rapi (0, 1, 2, 3...)
    // Ini agak kompleks di SQL, untuk MVP bisa kita skip dulu atau
    // andalkan client-side state yang sudah rapi.

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Gagal memindahkan task" };
  }
}

export async function deleteTaskAction(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    await prisma.task.delete({ where: { id: taskId } });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Gagal menghapus task" };
  }
}
