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
        return { success: false, message: "Password saat ini salah." };
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return { success: true, message: "Password berhasil diperbarui." };
  } catch {
    return { success: false, message: "Gagal mengubah password." };
  }
}

export async function deleteAccountAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, message: unlock.message };

  try {
    await prisma.user.delete({ where: { id: session.user.id } });
    return { success: true, message: "Akun berhasil dihapus." };
  } catch {
    return { success: false, message: "Gagal menghapus akun." };
  }
}

export async function updateProfileImageAction(imageUrl: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, message: unlock.message };

  const normalized = imageUrl.trim();
  if (!isAllowedProfileImageUrl(normalized)) {
    return { success: false, message: "URL gambar tidak valid." };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: normalized },
    });
    revalidatePath("/");
    return { success: true, message: "Foto profil diperbarui." };
  } catch {
    return { success: false, message: "Gagal memperbarui foto." };
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
    return { success: true, message: "Format tanggal diperbarui." };
  } catch {
    return { success: false, message: "Gagal update format tanggal." };
  }
}
