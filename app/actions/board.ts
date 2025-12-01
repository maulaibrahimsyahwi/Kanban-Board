"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createBoardAction(projectId: string, name: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    // Cari order terakhir untuk menaruh board di paling kanan
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

    revalidatePath("/");
    return { success: true, data: newBoard };
  } catch (error) {
    return { success: false, message: "Gagal membuat board" };
  }
}

export async function deleteBoardAction(boardId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    await prisma.board.delete({
      where: { id: boardId },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Gagal menghapus board" };
  }
}

export async function updateBoardAction(boardId: string, name: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    const updatedBoard = await prisma.board.update({
      where: { id: boardId },
      data: { name },
    });
    revalidatePath("/");
    return { success: true, data: updatedBoard };
  } catch (error) {
    return { success: false, message: "Gagal update board" };
  }
}
