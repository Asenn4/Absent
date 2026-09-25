import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contentType = request.headers.get("content-type") || "";
    let nama = "";
    let email = "";
    let role = "user";
    let photo: Blob | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      nama = ((formData.get("nama") as string) || "").trim();
      email = ((formData.get("email") as string) || "").trim();
      role = ((formData.get("role") as string) || "user").trim();
      const photoFile = formData.get("photo");
      if (photoFile && typeof photoFile === "object" && "arrayBuffer" in photoFile) {
        photo = photoFile as Blob;
      }
    } else {
      const body = await request.json();
      nama = (body.nama || "").trim();
      email = (body.email || "").trim();
      role = (body.role || "user").trim();
    }

    const updateData: any = {};
    if (nama) updateData.nama = nama;
    if (email) updateData.email = email;
    if (role) updateData.role = role;

    // Jika ada foto baru yang diunggah saat edit
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
        return NextResponse.json({ 
          error: "Gagal terhubung ke engine AI FastAPI di port 8000." 
        }, { status: 503 });
      }

      if (!fastApiResponse.ok) {
        return NextResponse.json({ 
          error: "Wajah tidak terdeteksi pada foto. Pastikan foto wajah terlihat jelas dan menghadap kamera." 
        }, { status: 400 });
      }

      const { embedding } = await fastApiResponse.json();
      if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
        return NextResponse.json({ 
          error: "Model AI tidak dapat mengekstrak fitur wajah dari foto ini." 
        }, { status: 400 });
      }

      updateData.face_embed = JSON.stringify(embedding);

      // Simpan file foto fisik
      const bytes = await photo.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `face-${id}-${Date.now()}.jpg`;
      const uploadDir = join(process.cwd(), "public", "uploads", "faces");
      
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }
      
      const photoPath = join(uploadDir, filename);
      await writeFile(photoPath, buffer);
      const savedPhotoUrl = `/uploads/faces/${filename}`;

      await prisma.faceRegistration.create({
        data: {
          user_id: id,
          photo_url: savedPhotoUrl,
          status: "approved"
        }
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.faceRegistration.deleteMany({ where: { user_id: id } });
    await prisma.absen.deleteMany({ where: { user_id: id } });

    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal" }, { status: 500 });
  }
}
