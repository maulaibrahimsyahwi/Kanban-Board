"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendPasswordResetEmail } from "@/lib/mail";
import { z } from "zod";
import { headers } from "next/headers";
import crypto from "crypto";
import { getClientIpFromHeaders, rateLimit } from "@/lib/rate-limit";

const RegisterSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export async function registerUserAction(formData: FormData) {
  const ip = getClientIpFromHeaders(await headers());
  const limited = rateLimit(`auth:register:ip:${ip}`, {
    windowMs: 60 * 1000,
    max: 5,
  });
  if (!limited.ok) {
    return {
      success: false,
      message: "Terlalu banyak percobaan. Silakan coba lagi dalam 1 menit.",
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
          "Email sudah terdaftar. Silakan login (Google/credentials). Jika akun Anda dibuat via Google, login dulu lalu atur password dari Settings.",
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

    return { success: true, message: "Registrasi berhasil! Silakan login." };
  } catch {
    return { success: false, message: "Terjadi kesalahan saat registrasi." };
  }
}

export async function requestPasswordResetAction(email: string) {
  const emailSchema = z.string().email();
  const validation = emailSchema.safeParse(email);

  if (!validation.success) {
    return { success: false, message: "Email tidak valid." };
  }

  try {
    const ip = getClientIpFromHeaders(await headers());
    const limitedByIp = rateLimit(`auth:pwreset:request:ip:${ip}`, {
      windowMs: 60 * 1000,
      max: 5,
    });
    const limitedByEmail = rateLimit(`auth:pwreset:request:email:${email}`, {
      windowMs: 10 * 60 * 1000,
      max: 3,
    });
    if (!limitedByIp.ok || !limitedByEmail.ok) {
      return {
        success: false,
        message: "Terlalu banyak permintaan. Silakan coba lagi nanti.",
      };
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return {
        success: true,
        message: "Jika email terdaftar, kode telah dikirim.",
      };
    }

    const authSecret = process.env.AUTH_SECRET;
    if (!authSecret) {
      return { success: false, message: "Konfigurasi server belum lengkap." };
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
        message: "Gagal mengirim email. Coba lagi nanti.",
      };
    }

    return { success: true, message: "Kode verifikasi dikirim ke email." };
  } catch (error) {
    return { success: false, message: "Terjadi kesalahan server." };
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
    return { success: false, message: "Data tidak valid." };
  }

  try {
    const ip = getClientIpFromHeaders(await headers());
    const limitedByIp = rateLimit(`auth:pwreset:confirm:ip:${ip}`, {
      windowMs: 60 * 1000,
      max: 10,
    });
    const limitedByEmail = rateLimit(`auth:pwreset:confirm:email:${email}`, {
      windowMs: 15 * 60 * 1000,
      max: 20,
    });
    if (!limitedByIp.ok || !limitedByEmail.ok) {
      return {
        success: false,
        message: "Terlalu banyak percobaan. Silakan coba lagi nanti.",
      };
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { success: false, message: "Kode salah atau telah kadaluarsa." };
    }

    const authSecret = process.env.AUTH_SECRET;
    if (!authSecret) {
      return { success: false, message: "Konfigurasi server belum lengkap." };
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { email },
    });

    if (!resetToken) {
      return { success: false, message: "Kode salah atau telah kadaluarsa." };
    }

    if (new Date() > resetToken.expires) {
      await prisma.passwordResetToken.delete({ where: { email } });
      return { success: false, message: "Kode salah atau telah kadaluarsa." };
    }

    const MAX_ATTEMPTS = 5;
    if (resetToken.attempts >= MAX_ATTEMPTS) {
      await prisma.passwordResetToken.delete({ where: { email } });
      return {
        success: false,
        message: "Terlalu banyak percobaan. Silakan request kode ulang.",
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
      return { success: false, message: "Kode salah atau telah kadaluarsa." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    await prisma.passwordResetToken.delete({ where: { email } });

    return {
      success: true,
      message: "Password berhasil diubah. Silakan login.",
    };
  } catch (error) {
    return { success: false, message: "Gagal mereset password." };
  }
}
