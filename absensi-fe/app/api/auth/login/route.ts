import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
    }

    // Cari pengguna berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: "Email tidak ditemukan" }, { status: 401 });
    }

    // Verifikasi password dengan bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role
      }
    });

    // Set cookie untuk role dan user_id
    response.cookies.set("auth_role", user.role, {
      path: "/",
      maxAge: 86400, // 1 hari
      httpOnly: false, // agar bisa diakses oleh client component
    });
    
    response.cookies.set("user_id", user.id, {
      path: "/",
      maxAge: 86400,
      httpOnly: false,
    });

    return response;

  } catch (error: any) {
    console.error("Error API Login:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal" }, { status: 500 });
  }
}
