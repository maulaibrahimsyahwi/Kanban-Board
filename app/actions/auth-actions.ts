"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendPasswordResetEmail } from "@/lib/mail";
import { z } from "zod";
import { headers } from "next/headers";
import crypto from "crypto";
import { getClientIpFromHeaders, rateLimit } from "@/lib/rate-limit";

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function registerUserAction(formData: FormData) {
  const ip = getClientIpFromHeaders(await headers());
  const limited = await rateLimit(`auth:register:ip:${ip}`, {
    windowMs: 60 * 1000,
    max: 5,
  });
  if (!limited.ok) {
    return {
      success: false,
      message: "Too many attempts. Please try again in 1 minute.",
    };
  }

  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const validation = RegisterSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0].message,
    };
  }

  const { name, email, password } = validation.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        message:
          "Email is already registered. Please sign in (Google/credentials). If your account was created via Google, sign in first and then set a password in Settings.",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        projectsOwned: {
          create: {
            name: "My First Project",
            boards: {
              create: [
                { name: "To Do", order: 0 },
                { name: "In Progress", order: 1 },
                { name: "Done", order: 2 },
              ],
            },
          },
        },
      },
    });

    return { success: true, message: "Registration successful! Please sign in." };
  } catch {
    return { success: false, message: "An error occurred during registration." };
  }
}

export async function requestPasswordResetAction(email: string) {
  const emailSchema = z.string().email();
  const validation = emailSchema.safeParse(email);

  if (!validation.success) {
    return { success: false, message: "Invalid email." };
  }

  try {
    const ip = getClientIpFromHeaders(await headers());
    const [limitedByIp, limitedByEmail] = await Promise.all([
      rateLimit(`auth:pwreset:request:ip:${ip}`, {
        windowMs: 60 * 1000,
        max: 5,
      }),
      rateLimit(`auth:pwreset:request:email:${email}`, {
        windowMs: 10 * 60 * 1000,
        max: 3,
      }),
    ]);
    if (!limitedByIp.ok || !limitedByEmail.ok) {
      return {
        success: false,
        message: "Too many requests. Please try again later.",
      };
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return {
        success: true,
        message: "If the email is registered, a code has been sent.",
      };
    }

    const authSecret = process.env.AUTH_SECRET;
    if (!authSecret) {
      return { success: false, message: "Server configuration is incomplete." };
    }

    const token = crypto.randomInt(100000, 1000000).toString();
    const expires = new Date(new Date().getTime() + 15 * 60 * 1000);

    const tokenHash = crypto
      .createHash("sha256")
      .update(`${email}:${token}:${authSecret}`)
      .digest("hex");

    await prisma.passwordResetToken.upsert({
      where: { email },
      update: {
        tokenHash,
        expires,
        attempts: 0,
        userId: user.id,
      },
      create: {
        email,
        tokenHash,
        expires,
        attempts: 0,
        userId: user.id,
      },
    });

    const sent = await sendPasswordResetEmail(email, token);

    if (!sent) {
      return {
        success: false,
        message: "Failed to send email. Please try again later.",
      };
    }

    return { success: true, message: "Verification code sent to your email." };
  } catch (error) {
    return { success: false, message: "Server error." };
  }
}

export async function resetPasswordAction(
  email: string,
  code: string,
  newPassword: string
) {
  const schema = z.object({
    email: z.string().email(),
    code: z.string().length(6),
    newPassword: z.string().min(8),
  });

  const validation = schema.safeParse({ email, code, newPassword });
  if (!validation.success) {
    return { success: false, message: "Invalid data." };
  }

  try {
    const ip = getClientIpFromHeaders(await headers());
    const [limitedByIp, limitedByEmail] = await Promise.all([
      rateLimit(`auth:pwreset:confirm:ip:${ip}`, {
        windowMs: 60 * 1000,
        max: 10,
      }),
      rateLimit(`auth:pwreset:confirm:email:${email}`, {
        windowMs: 15 * 60 * 1000,
        max: 20,
      }),
    ]);
    if (!limitedByIp.ok || !limitedByEmail.ok) {
      return {
        success: false,
        message: "Too many attempts. Please try again later.",
      };
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { success: false, message: "Code is incorrect or expired." };
    }

    const authSecret = process.env.AUTH_SECRET;
    if (!authSecret) {
      return { success: false, message: "Server configuration is incomplete." };
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { email },
    });

    if (!resetToken) {
      return { success: false, message: "Code is incorrect or expired." };
    }

    if (new Date() > resetToken.expires) {
      await prisma.passwordResetToken.delete({ where: { email } });
      return { success: false, message: "Code is incorrect or expired." };
    }

    const MAX_ATTEMPTS = 5;
    if (resetToken.attempts >= MAX_ATTEMPTS) {
      await prisma.passwordResetToken.delete({ where: { email } });
      return {
        success: false,
        message: "Too many attempts. Please request a new code.",
      };
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(`${email}:${code}:${authSecret}`)
      .digest("hex");

    if (tokenHash !== resetToken.tokenHash) {
      await prisma.passwordResetToken.update({
        where: { email },
        data: { attempts: { increment: 1 } },
      });
      return { success: false, message: "Code is incorrect or expired." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    await prisma.passwordResetToken.delete({ where: { email } });

    return {
      success: true,
      message: "Password changed successfully. Please sign in.",
    };
  } catch (error) {
    return { success: false, message: "Failed to reset password." };
  }
}
