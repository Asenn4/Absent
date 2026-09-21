import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile } from "fs/promises";
import { join } from "path";
import fs from "fs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("photo") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Buat nama file unik
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Pastikan folder uploads ada
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'faces');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const path = join(uploadDir, filename);
    await writeFile(path, buffer);
    
    const photoUrl = `/uploads/faces/${filename}`;

    // Ambil user_id dari cookie sesi
    const userId = request.cookies.get("user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Sesi tidak ditemukan" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak valid" }, { status: 401 });
    }

    // Buat record pendaftaran di database
    const registration = await prisma.faceRegistration.create({
      data: {
        user_id: user.id,
        photo_url: photoUrl,
        status: "pending"
      }
    });

    return NextResponse.json({ success: true, data: registration });
  } catch (error: any) {
    console.error("Error in face registration:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
