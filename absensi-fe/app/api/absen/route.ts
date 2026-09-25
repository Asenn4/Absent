import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Fungsi untuk menghitung Cosine Similarity antara dua vektor
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
    const scanMode = (formData.get("scanMode") as string) || "checkIn"; // "checkIn" atau "checkOut"

    if (!photo) {
      return NextResponse.json({ error: "Foto tidak tersedia / belum diambil" }, { status: 400 });
    }

    // 1. Ekstrak vektor embedding wajah dari FastAPI
    const fastApiFormData = new FormData();
    fastApiFormData.append("file", photo, "capture.jpg");

    let fastApiResponse: Response;
    try {
      fastApiResponse = await fetch("http://localhost:8000/api/train-face", {
        method: "POST",
        body: fastApiFormData,
      });
    } catch (netErr: any) {
      console.error("FastAPI offline / connection error:", netErr);
      return NextResponse.json({ error: "Mesin AI FastAPI tidak aktif di port 8000." }, { status: 503 });
    }

    if (!fastApiResponse.ok) {
      const errorText = await fastApiResponse.text();
      return NextResponse.json({ error: "Wajah tidak terdeteksi oleh sistem AI." }, { status: 400 });
    }

    const { embedding } = await fastApiResponse.json();

    if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
      return NextResponse.json({ error: "Wajah tidak terdeteksi pada kamera." }, { status: 400 });
    }

    // 2. Ambil seluruh data pengguna yang telah memiliki vektor wajah (1:N Matching Kiosk)
    const registeredUsers = await prisma.user.findMany({
      where: {
        face_embed: {
          not: null
        }
      },
      select: {
        id: true,
        nama: true,
        email: true,
        face_embed: true
      }
    });

    if (registeredUsers.length === 0) {
      return NextResponse.json({ error: "Belum ada wajah pengguna yang terdaftar di database." }, { status: 400 });
    }

    // 3. Cari pengguna dengan tingkat kecocokan tertinggi
    let bestUser: typeof registeredUsers[0] | null = null;
    let bestScore = -1;
    const THRESHOLD = 0.45; // Ambang batas kemiripan aman & responsif

    for (const u of registeredUsers) {
      try {
        if (!u.face_embed) continue;
        const userVector = JSON.parse(u.face_embed);
        if (Array.isArray(userVector) && userVector.length === embedding.length) {
          const score = cosineSimilarity(embedding, userVector);
          if (score > bestScore) {
            bestScore = score;
            bestUser = u;
          }
        }
      } catch (parseErr) {
        console.error("Gagal membaca vektor wajah user:", u.id, parseErr);
      }
    }

    // Jika kemiripan tidak melampaui batas minimal
    if (!bestUser || bestScore < THRESHOLD) {
      return NextResponse.json({
        error: "Wajah tidak cocok dengan data pengguna manapun atau belum terdaftar!",
        bestScore: bestScore > 0 ? Number(bestScore.toFixed(3)) : 0
      }, { status: 403 });
    }

    // 4. Validasi Kehadiran Hari Ini
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const recentAbsen = await prisma.absen.findMany({
      where: { 
        user_id: bestUser.id,
        scan_time: { gte: yesterday }
      }
    });

    const currentJakartaDate = now.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" });
    const todayAbsen = recentAbsen.filter(record => {
       const recordDate = new Date(record.scan_time).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" });
       return recordDate === currentJakartaDate;
    });

    // Jika sudah absen masuk hari ini: Kembalikan status sukses (agar demo tidak error)
    if (scanMode === "checkIn") {
       const existingCheckIn = todayAbsen.find(a => a.status !== "Pulang");
       if (existingCheckIn) {
          return NextResponse.json({ 
            success: true, 
            alreadyChecked: true,
            message: `${bestUser.nama} sudah tercatat absen masuk hari ini`, 
            user: { 
              id: bestUser.id,
              name: bestUser.nama,
              email: bestUser.email
            },
            score: Number(bestScore.toFixed(3)),
            status: existingCheckIn.status
          });
       }
    } else if (scanMode === "checkOut") {
       const existingCheckOut = todayAbsen.find(a => a.status === "Pulang");
       if (existingCheckOut) {
          return NextResponse.json({ 
            success: true, 
            alreadyChecked: true,
            message: `${bestUser.nama} sudah tercatat absen keluar hari ini`, 
            user: { 
              id: bestUser.id,
              name: bestUser.nama,
              email: bestUser.email
            },
            score: Number(bestScore.toFixed(3)),
            status: "Pulang"
          });
       }
    }

    // 5. Simpan foto bukti fisik
    const bytes = await photo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `absen-${bestUser.id}-${Date.now()}.jpg`;
    const uploadDir = join(process.cwd(), "public", "uploads", "absen");
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    const photoPath = join(uploadDir, filename);
    await writeFile(photoPath, buffer);
    const photoUrl = `/uploads/absen/${filename}`;

    // 6. Hitung Status Absen (Berdasarkan Jam WIB)
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
      status = "Pulang";
    }

    // 7. Simpan Record ke Database
    await prisma.absen.create({
      data: {
        user_id: bestUser.id,
        device_loc: "Kiosk Terminal 01",
        status: status,
        confidence_score: Number(bestScore.toFixed(4)),
        photo_url: photoUrl
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Wajah berhasil dikenali", 
      user: { 
        id: bestUser.id,
        name: bestUser.nama,
        email: bestUser.email
      },
      score: Number(bestScore.toFixed(3)),
      status: status,
      alreadyChecked: false
    });

  } catch (error: any) {
    console.error("Error API absen:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal pada server absensi." }, { status: 500 });
  }
}
