import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { create_at: "desc" },
      include: {
        face_reqs: {
          orderBy: { created_at: "desc" },
          take: 1
        }
      }
    });
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let nama = "";
    let email = "";
    let password = "password123";
    let role = "user";
    let photo: Blob | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      nama = ((formData.get("nama") as string) || "").trim();
      email = ((formData.get("email") as string) || "").trim();
      password = ((formData.get("password") as string) || "").trim() || "123456";
      role = ((formData.get("role") as string) || "user").trim();
      const photoFile = formData.get("photo");
      if (photoFile && typeof photoFile === "object" && "arrayBuffer" in photoFile) {
        photo = photoFile as Blob;
      }
    } else {
      const body = await request.json();
      nama = (body.nama || "").trim();
      email = (body.email || "").trim();
      password = (body.password || "").trim() || "123456";
      role = (body.role || "user").trim();
    }

    if (!nama || !email) {
      return NextResponse.json({ error: "Nama dan Email wajib diisi" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: `Email ${email} sudah terdaftar di sistem` }, { status: 400 });
    }

    let faceEmbedString: string | null = null;
    let savedPhotoUrl: string | null = null;

    // Jika foto disertakan, ekstrak vektor wajah via FastAPI
    if (photo && photo.size > 0) {
      const fastApiFormData = new FormData();
      fastApiFormData.append("file", photo, "user_face.jpg");

      let fastApiResponse: Response;
      try {
        fastApiResponse = await fetch("http://localhost:8000/api/train-face", {
          method: "POST",
          body: fastApiFormData,
        });
      } catch (netErr: any) {
        console.error("FastAPI error:", netErr);
        return NextResponse.json({ 
          error: "Gagal terhubung ke engine AI FastAPI di port 8000. Pastikan backend Python aktif." 
        }, { status: 503 });
      }

      if (!fastApiResponse.ok) {
        const errorText = await fastApiResponse.text();
        return NextResponse.json({ 
          error: "Wajah tidak terdeteksi pada foto. Pastikan foto wajah terlihat jelas dan menghadap kamera." 
        }, { status: 400 });
      }

      const { embedding } = await fastApiResponse.json();
      if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
        return NextResponse.json({ 
          error: "Model AI tidak dapat mengekstrak fitur wajah dari foto ini. Harap gunakan foto lain." 
        }, { status: 400 });
      }

      faceEmbedString = JSON.stringify(embedding);

      // Simpan file foto secara fisik
      const bytes = await photo.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `face-${Date.now()}-${Math.round(Math.random() * 1000)}.jpg`;
      const uploadDir = join(process.cwd(), "public", "uploads", "faces");
      
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }
      
      const photoPath = join(uploadDir, filename);
      await writeFile(photoPath, buffer);
      savedPhotoUrl = `/uploads/faces/${filename}`;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        nama,
        email,
        password: hashedPassword,
        role,
        face_embed: faceEmbedString
      }
    });

    if (savedPhotoUrl) {
      await prisma.faceRegistration.create({
        data: {
          user_id: user.id,
          photo_url: savedPhotoUrl,
          status: "approved"
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: user,
      hasFace: !!faceEmbedString,
      message: faceEmbedString 
        ? "Pengguna & Model Wajah AI berhasil didaftarkan" 
        : "Pengguna berhasil ditambahkan (Tanpa Foto Wajah)"
    });

  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal saat mendaftarkan pengguna." }, { status: 500 });
  }
}
