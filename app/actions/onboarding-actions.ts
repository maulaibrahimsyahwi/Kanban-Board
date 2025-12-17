"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ensureTwoFactorUnlocked } from "@/lib/two-factor-session";

interface OnboardingData {
  teamSize: string;
  usagePurpose: string;
  industry: string;
}

export async function submitOnboardingAction(data: OnboardingData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) return { success: false, message: unlock.message };

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        teamSize: data.teamSize,
        usagePurpose: data.usagePurpose,
        industry: data.industry,
        onboardingCompleted: true,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, message: "Gagal menyimpan data." };
  }
}
