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
import { headers } from "next/headers";
import { getClientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { maybeDecryptString, maybeEncryptString } from "@/lib/crypto";

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
    return { success: false, message: "Invalid verification code." };
  }

  let encryptedSecret: string;
  try {
    encryptedSecret = maybeEncryptString(secret);
  } catch {
    return {
      success: false,
      message:
        "Server configuration is incomplete: DATA_ENCRYPTION_KEY must be set to store the 2FA secret securely.",
    };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      twoFactorEnabled: true,
      twoFactorSecret: encryptedSecret,
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
    const ip = getClientIpFromHeaders(await headers());
    const [limitedByIp, limitedByUser] = await Promise.all([
      rateLimit(`auth:2fa:verify:ip:${ip}`, {
        windowMs: 60 * 1000,
        max: 10,
      }),
      rateLimit(`auth:2fa:verify:user:${session.user.id}`, {
        windowMs: 60 * 1000,
        max: 5,
      }),
    ]);
    if (!limitedByIp.ok || !limitedByUser.ok) {
      return {
        success: false,
        message: "Too many attempts. Please try again later.",
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.twoFactorSecret) {
      return { success: false, message: "2FA not setup correctly" };
    }

    let decryptedSecret = "";
    try {
      decryptedSecret = maybeDecryptString(user.twoFactorSecret);
    } catch {
      return { success: false, message: "2FA not setup correctly" };
    }

    const isValid = authenticator.verify({
      token: code,
      secret: decryptedSecret,
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
