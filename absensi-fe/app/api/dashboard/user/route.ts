import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("user_id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Tidak ada sesi aktif" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userAbsen = await prisma.absen.findMany({
      where: { user_id: userId },
      orderBy: { scan_time: 'desc' }
    });

    const isVerified = await prisma.faceRegistration.findFirst({
      where: { user_id: userId, status: "approved" }
    });

    // Kalkulasi persentase kehadiran bulan ini
    // Sederhananya kita asumsikan 90% (dummy) jika data belum banyak, atau hitung riil:
    const presentCount = userAbsen.filter(a => a.status === "Hadir").length;
    // Misalnya total hari kerja sebulan 20 hari
    const attendanceRate = Math.min(100, Math.round((presentCount / 20) * 100)) || 0;

    return NextResponse.json({
      success: true,
      data: {
        attendanceRate,
        isVerified: !!isVerified,
        history: userAbsen.slice(0, 5) // Ambil 5 riwayat terakhir untuk dashboard
      }
    });
  } catch (error) {
    console.error("Error fetching user dashboard:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
