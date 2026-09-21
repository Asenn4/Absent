import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { create_at: "desc" }
    });
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nama, email, password, role } = await request.json();

    if (!nama || !email || !password || !role) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email sudah digunakan" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        nama,
        email,
        password: hashedPassword,
        role
      }
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal" }, { status: 500 });
  }
}
