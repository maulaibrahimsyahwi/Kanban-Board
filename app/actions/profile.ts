"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { ensureTwoFactorUnlocked } from "@/lib/two-factor-session";

function isAllowedProfileImageUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.length > 2048) return false;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return false;
  }

  if (parsed.protocol !== "https:") return false;

  const hostname = parsed.hostname.toLowerCase();
  if (hostname.endsWith(".supabase.co")) {
    return (
      parsed.pathname.startsWith("/storage/v1/object/public/avatars/") ||
      parsed.pathname.startsWith("/storage/v1/object/sign/avatars/")
    );
  }

  if (hostname === "lh3.googleusercontent.com" || hostname.endsWith(".googleusercontent.com")) {
    return true;
  }

  return false;
}

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, message: unlock.message };

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    if (user.password) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return { success: false, message: "Current password is incorrect." };
      }
    }

    if (newPassword.trim().length < 8) {
      return {
        success: false,
        message: "New password must be at least 8 characters long.",
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return { success: true, message: "Password updated successfully." };
  } catch {
    return { success: false, message: "Failed to change password." };
  }
}

export async function deleteAccountAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, message: unlock.message };

  try {
    await prisma.user.delete({ where: { id: session.user.id } });
    return { success: true, message: "Account deleted successfully." };
  } catch {
    return { success: false, message: "Failed to delete account." };
  }
}

export async function updateProfileImageAction(imageUrl: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, message: unlock.message };

  const normalized = imageUrl.trim();
  if (!isAllowedProfileImageUrl(normalized)) {
    return { success: false, message: "Invalid image URL." };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: normalized },
    });
    revalidatePath("/");
    return { success: true, message: "Profile photo updated." };
  } catch {
    return { success: false, message: "Failed to update photo." };
  }
}

export async function updateDateFormatAction(format: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, message: unlock.message };

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { dateFormat: format },
    });
    revalidatePath("/");
    return { success: true, message: "Date format updated." };
  } catch {
    return { success: false, message: "Failed to update date format." };
  }
}
