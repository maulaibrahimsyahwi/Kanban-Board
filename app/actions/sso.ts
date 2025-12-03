"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSSOSettingsAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, data: null };

  try {
    const settings = await prisma.sSOSettings.findUnique({
      where: { userId: session.user.id },
    });
    return { success: true, data: settings };
  } catch (error) {
    return { success: false, message: "Failed to fetch SSO settings" };
  }
}

interface SSOSettingsData {
  domain?: string;
  ssoUrl?: string;
  issuer?: string;
  certificate?: string;
  forceSSO?: boolean;
  isActive?: boolean;
}

export async function updateSSOSettingsAction(data: SSOSettingsData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    const existing = await prisma.sSOSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (existing) {
      await prisma.sSOSettings.update({
        where: { userId: session.user.id },
        data: { ...data },
      });
    } else {
      await prisma.sSOSettings.create({
        data: {
          userId: session.user.id,
          ...data,
          isActive: true,
        },
      });
    }

    revalidatePath("/settings/security");
    return { success: true, message: "SSO settings saved successfully" };
  } catch (error) {
    return { success: false, message: "Failed to save settings" };
  }
}

export async function deactivateSSOAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    const existing = await prisma.sSOSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!existing) {
      return { success: true, message: "SSO configuration closed" };
    }

    await prisma.sSOSettings.update({
      where: { userId: session.user.id },
      data: { isActive: false },
    });

    revalidatePath("/settings/security");
    return { success: true, message: "SSO deactivated" };
  } catch (error) {
    return { success: false, message: "Failed to deactivate SSO" };
  }
}
