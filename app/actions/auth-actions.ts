"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function registerUserAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { success: false, message: "Semua kolom harus diisi" };
  }

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
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return {
        success: true,
        message: "Jika email terdaftar, kode telah dikirim.",
      };
    }

    if (!user.password) {
      return { success: false, message: "Akun ini menggunakan Google Login." };
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
