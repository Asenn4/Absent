import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Fungsi untuk menghitung Cosine Similarity
function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const photo = formData.get("photo") as Blob;
    const scanMode = formData.get("scanMode") as string; // "checkIn" atau "checkOut"

    if (!photo) {
      return NextResponse.json({ error: "No photo provided" }, { status: 400 });
    }

    // Ambil ID pengguna yang sedang login dari Cookie
    const userIdCookie = request.cookies.get("user_id");
    const loggedInUserId = userIdCookie?.value;

    if (!loggedInUserId) {
      return NextResponse.json({ error: "Sesi login tidak valid. Harap login ulang." }, { status: 401 });
    }

    // 1. Minta FastAPI untuk mengekstrak vektor wajah dari gambar
    const fastApiFormData = new FormData();
    fastApiFormData.append("file", photo, "capture.jpg");

    const fastApiResponse = await fetch("http://localhost:8000/api/train-face", {
      method: "POST",
      body: fastApiFormData,
    });

    if (!fastApiResponse.ok) {
      const errorText = await fastApiResponse.text();
      return NextResponse.json({ error: "Gagal mengekstrak wajah: " + errorText }, { status: 400 });
    }

    const { embedding } = await fastApiResponse.json();

    if (!embedding || embedding.length === 0) {
      return NextResponse.json({ error: "Wajah tidak terdeteksi oleh sistem." }, { status: 400 });
    }

    // 2. Tarik data PENGGUNA YANG SEDANG LOGIN SAJA (Verifikasi 1:1)
    const user = await prisma.user.findUnique({
      where: { id: loggedInUserId }
    });

    if (!user) {
      return NextResponse.json({ error: "Akun pengguna tidak ditemukan." }, { status: 404 });
    }
    
    if (!user.face_embed) {
      return NextResponse.json({ error: "Anda belum mendaftarkan data wajah Anda di sistem." }, { status: 403 });
    }

    // 3. Bandingkan vektor wajah di kamera dengan wajah asli milik akun (Cosine Similarity)
    let similarityScore = 0;
    const THRESHOLD = 0.5; // Ambang batas kemiripan minimal

    try {
      const userVector = JSON.parse(user.face_embed);
      if (Array.isArray(userVector) && userVector.length === embedding.length) {
        similarityScore = cosineSimilarity(embedding, userVector);
      }
    } catch (e) {
      console.error("Gagal memparsing vektor untuk user:", user.id);
      return NextResponse.json({ error: "Data wajah internal rusak." }, { status: 500 });
    }

    // Jika wajah cocok (skor melebihi batas)
    if (similarityScore >= THRESHOLD) {
      // 4. Catat Kehadiran dan Simpan Foto
      const now = new Date();
      
      // Simpan foto bukti absen secara fisik
      const bytes = await photo.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `absen-${user.id}-${Date.now()}.jpg`;
      const uploadDir = join(process.cwd(), "public", "uploads", "absen");
      
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }
      
      const photoPath = join(uploadDir, filename);
      await writeFile(photoPath, buffer);
      const photoUrl = `/uploads/absen/${filename}`;

      // Pastikan perhitungan jam menggunakan zona waktu lokal WIB (Asia/Jakarta)
      const jakartaTimeStr = now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
      const jakartaTime = new Date(jakartaTimeStr);
      const hours = jakartaTime.getHours();
      
      let status = "Hadir";
      if (scanMode === "checkIn") {
        if (hours >= 9) {
          status = "Terlambat";
        } else {
          status = "Hadir";
        }
      } else if (scanMode === "checkOut") {
        // Opsi A: Dilarang absen pulang sebelum jam 15:00 WIB
        if (hours < 15) {
          return NextResponse.json(
            { error: "BELUM WAKTUNYA PULANG" },
            { status: 400 }
          );
        }
        status = "Pulang";
      }

      const absenRecord = await prisma.absen.create({
        data: {
          user_id: user.id,
          device_loc: "Gate A",
          status: status,
          confidence_score: similarityScore,
          photo_url: photoUrl
        }
      });

      return NextResponse.json({ 
        success: true, 
        message: "Wajah dikenali", 
        user: { name: user.nama },
        score: similarityScore,
        status: status
      });

    } else {
      // Wajah yang disorot kamera BUKAN pemilik akun!
      return NextResponse.json({ error: "Wajah tidak cocok dengan pemilik akun ini! Akses ditolak." }, { status: 403 });
    }

  } catch (error: any) {
    console.error("Error API absen:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal." }, { status: 500 });
  }
}
