"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { authenticator } from "otplib";
import { revalidatePath } from "next/cache";
import {
  clearTwoFactorVerifiedCookie,
  ensureTwoFactorUnlocked,
  isTwoFactorRequiredForSession,
  isTwoFactorVerifiedForCurrentRequest,
  setTwoFactorVerifiedCookie,
} from "@/lib/two-factor-session";

export async function getTwoFactorLockStateAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, locked: false };

  const required = isTwoFactorRequiredForSession(session);
  const verified = await isTwoFactorVerifiedForCurrentRequest(session.user.id);
  return { success: true, locked: required && !verified };
}

export async function generateTwoFactorSecretAction() {
  const session = await auth();
  if (!session?.user?.email) return { success: false };

  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(
    session.user.email,
    "FreeKanban",
    secret
  );

  return { success: true, secret, otpauth };
}

export async function activateTwoFactorAction(token: string, secret: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, message: unlock.message };

  const isValid = authenticator.verify({ token, secret });

  if (!isValid) {
    return { success: false, message: "Kode verifikasi salah." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      twoFactorEnabled: true,
      twoFactorSecret: secret,
    },
  });

  // Current session already proved possession of the authenticator.
  try {
    await setTwoFactorVerifiedCookie(session.user.id);
  } catch {}

  revalidatePath("/settings/security");
  return { success: true };
}

export async function disableTwoFactorAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, message: unlock.message };

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    },
  });

  await clearTwoFactorVerifiedCookie();

  revalidatePath("/settings/security");
  return { success: true };
}

export async function verifyTwoFactorLoginAction(code: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.twoFactorSecret) {
      return { success: false, message: "2FA not setup correctly" };
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      return { success: false, message: "Invalid verification code" };
    }

    await setTwoFactorVerifiedCookie(session.user.id);
    return { success: true };
  } catch (error) {
    return { success: false, message: "Verification failed" };
  }
}
