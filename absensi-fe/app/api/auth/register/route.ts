import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { nama, email, password } = await request.json();

    if (!nama || !email || !password) {
      return NextResponse.json({ error: "Nama, email, dan password wajib diisi" }, { status: 400 });
    }

    // Periksa apakah email sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat pengguna baru, secara default role-nya 'user'
    const user = await prisma.user.create({
      data: {
        nama,
        email,
        password: hashedPassword,
        role: "user"
      }
    });

    return NextResponse.json({
      success: true,
      message: "Pendaftaran berhasil, silakan login",
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role
      }
    });

  } catch (error: any) {
    console.error("Error API Register:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal" }, { status: 500 });
  }
}
