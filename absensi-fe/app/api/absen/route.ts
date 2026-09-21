import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

    // 2. Tarik semua pengguna yang sudah mendaftarkan wajahnya
    const users = await prisma.user.findMany({
      where: {
        face_embed: {
          not: null
        }
      }
    });

    if (users.length === 0) {
      return NextResponse.json({ error: "Belum ada pengguna yang terdaftar di database." }, { status: 404 });
    }

    // 3. Bandingkan vektor (Cosine Similarity)
    let bestMatch = null;
    let highestScore = 0;
    const THRESHOLD = 0.5; // Ambang batas kemiripan, bisa disesuaikan

    for (const user of users) {
      try {
        const userVector = JSON.parse(user.face_embed!);
        if (Array.isArray(userVector) && userVector.length === embedding.length) {
          const score = cosineSimilarity(embedding, userVector);
          if (score > highestScore) {
            highestScore = score;
            bestMatch = user;
          }
        }
      } catch (e) {
        console.error("Gagal memparsing vektor untuk user:", user.id);
      }
    }

    if (bestMatch && highestScore >= THRESHOLD) {
      // 4. Catat Kehadiran
      const now = new Date();
      const hours = now.getHours();
      
      // Logika sederhana: jika sebelum jam 8 pagi, maka "Hadir", selain itu "Terlambat"
      let status = "Hadir";
      if (scanMode === "checkIn" && hours >= 8) {
        status = "Terlambat";
      } else if (scanMode === "checkOut") {
        status = "Pulang";
      }

      const absenRecord = await prisma.absen.create({
        data: {
          user_id: bestMatch.id,
          device_loc: "Gate A",
          status: status,
          confidence_score: highestScore
        }
      });

      return NextResponse.json({ 
        success: true, 
        message: "Wajah dikenali", 
        user: { name: bestMatch.nama },
        score: highestScore 
      });

    } else {
      return NextResponse.json({ error: "Wajah tidak dikenali. Silakan coba lagi." }, { status: 401 });
    }

  } catch (error: any) {
    console.error("Error API absen:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal." }, { status: 500 });
  }
}
