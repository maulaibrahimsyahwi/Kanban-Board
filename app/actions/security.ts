"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { authenticator } from "otplib";
import { revalidatePath } from "next/cache";

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

  const isValid = authenticator.verify({ token, secret });

  if (!isValid) {
    return { success: false, message: "Kode verifikasi salah." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      twoFactorEnabled: true as any,
      twoFactorSecret: secret as any,
    },
  });

  revalidatePath("/settings/security");
  return { success: true };
}

export async function disableTwoFactorAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      twoFactorEnabled: false as any,
      twoFactorSecret: null as any,
    },
  });

  revalidatePath("/settings/security");
  return { success: true };
}
