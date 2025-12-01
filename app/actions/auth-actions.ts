"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerUserAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { success: false, message: "Semua kolom harus diisi" };
  }

  try {
    // 1. Cek apakah user sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // --- LOGIKA BARU: SINKRONISASI AKUN ---

      // Jika user ada TAPI tidak punya password (berarti dia daftar pakai Google/OAuth)
      if (!existingUser.password) {
        // Kita "upgrade" akun ini agar punya password juga
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
          where: { email },
          data: {
            password: hashedPassword,
            // Opsional: Update nama jika user Google belum punya nama (jarang terjadi)
            name: existingUser.name || name,
          },
        });

        return {
          success: true,
          message:
            "Akun Google Anda berhasil disinkronkan. Silakan login dengan password baru.",
        };
      }

      // Jika user sudah ada DAN sudah punya password
      return { success: false, message: "Email sudah terdaftar" };
    }

    // 2. Jika user benar-benar baru, buat seperti biasa
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // Buat project default untuk user baru
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
