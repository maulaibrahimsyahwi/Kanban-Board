"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NotificationSettingsState } from "@/types";

export async function getNotificationSettingsAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, data: null };

  try {
    let settings = await prisma.notificationSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: { userId: session.user.id },
      });
    }

    return { success: true, data: settings };
  } catch {
    return { success: false, message: "Gagal memuat pengaturan notifikasi" };
  }
}

export async function updateNotificationSettingsAction(
  data: NotificationSettingsState
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    await prisma.notificationSettings.update({
      where: { userId: session.user.id },
      data: {
        endDateTrigger: data.endDateTrigger,
        endDateEmail: data.endDateEmail,
        endDatePush: data.endDatePush,
        deadlineTrigger: data.deadlineTrigger,
        deadlineEmail: data.deadlineEmail,
        deadlinePush: data.deadlinePush,
        startDateTrigger: data.startDateTrigger,
        startDateEmail: data.startDateEmail,
        startDatePush: data.startDatePush,
        mentionsEmail: data.mentionsEmail,
        mentionsPush: data.mentionsPush,
        assignedEmail: data.assignedEmail,
        assignedPush: data.assignedPush,
        commentsEmail: data.commentsEmail,
        commentsPush: data.commentsPush,
        attachmentsEmail: data.attachmentsEmail,
        attachmentsPush: data.attachmentsPush,
        playSound: data.playSound,
        marketingEmails: data.marketingEmails,
      },
    });

    revalidatePath("/settings/notifications");
    return { success: true, message: "Pengaturan notifikasi disimpan" };
  } catch {
    return { success: false, message: "Gagal menyimpan pengaturan" };
  }
}

export async function restoreDefaultNotificationSettingsAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    await prisma.notificationSettings.update({
      where: { userId: session.user.id },
      data: {
        endDateTrigger: "1day",
        endDateEmail: true,
        endDatePush: true,
        deadlineTrigger: "1day",
        deadlineEmail: true,
        deadlinePush: true,
        startDateTrigger: "1day",
        startDateEmail: true,
        startDatePush: true,
        mentionsEmail: true,
        mentionsPush: true,
        assignedEmail: true,
        assignedPush: true,
        commentsEmail: true,
        commentsPush: true,
        attachmentsEmail: true,
        attachmentsPush: true,
        playSound: true,
        marketingEmails: true,
      },
    });

    revalidatePath("/settings/notifications");
    return { success: true, message: "Pengaturan dikembalikan ke default" };
  } catch {
    return { success: false, message: "Gagal mereset pengaturan" };
  }
}
