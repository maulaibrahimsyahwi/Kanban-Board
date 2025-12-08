"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendPasswordResetEmail } from "@/lib/mail";
import { z } from "zod";

const RegisterSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export async function registerUserAction(formData: FormData) {
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
      if (!existingUser.password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { email },
          data: {
            password: hashedPassword,
            name: existingUser.name || name,
          },
        });
        return {
          success: true,
          message: "Akun Google berhasil disinkronkan. Silakan login.",
        };
      }
      return { success: false, message: "Email sudah terdaftar" };
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
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return {
        success: true,
        message: "Jika email terdaftar, kode telah dikirim.",
      };
    }

    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(new Date().getTime() + 15 * 60 * 1000);

    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
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
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: code,
      },
    });

    if (!verificationToken) {
      return { success: false, message: "Kode salah atau tidak ditemukan." };
    }

    if (new Date() > verificationToken.expires) {
      return { success: false, message: "Kode telah kadaluarsa." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token: code,
        },
      },
    });

    return {
      success: true,
      message: "Password berhasil diubah. Silakan login.",
    };
  } catch (error) {
    return { success: false, message: "Gagal mereset password." };
  }
}
