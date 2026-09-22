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
      orderBy: { scan_time: 'asc' } // Urutkan dari lama ke baru agar check-in didapat pertama
    });

    const isVerified = await prisma.faceRegistration.findFirst({
      where: { user_id: userId, status: "approved" }
    });

    // Grouping berdasarkan tanggal
    const groupedAbsen = new Map<string, any>();
    
    userAbsen.forEach(record => {
      const dateObj = new Date(record.scan_time);
      
      // Ambil waktu lokal Jakarta untuk menghindari bug beda hari di server UTC
      const jakartaTimeStr = dateObj.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
      const jakartaTime = new Date(jakartaTimeStr);
      
      const year = jakartaTime.getFullYear();
      const month = String(jakartaTime.getMonth() + 1).padStart(2, '0');
      const day = String(jakartaTime.getDate()).padStart(2, '0');
      const rawDate = `${year}-${month}-${day}`; // Format YYYY-MM-DD aman
      
      const displayDate = jakartaTime.toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' });
      // Gunakan en-GB agar format jam konsisten memakai titik dua (:) misal 09:00:00
      const timeStr = jakartaTime.toLocaleTimeString('en-GB', { hour12: false });

      if (!groupedAbsen.has(rawDate)) {
        groupedAbsen.set(rawDate, {
          id: record.id,
          rawDate: rawDate,
          date: displayDate,
          checkIn: timeStr,
          checkOut: "-",
          status: record.status // Gunakan status scan pertama
        });
      } else {
        const existing = groupedAbsen.get(rawDate);
        existing.checkOut = timeStr; // Update dengan scan terakhir (jika > 1 kali scan)
      }
    });

    // Kalkulasi persentase kehadiran bulan ini
    // Menggunakan jumlah hari unik di mana user absen
    const presentCount = groupedAbsen.size;
    // Misalnya total hari kerja sebulan 20 hari
    const attendanceRate = Math.min(100, Math.round((presentCount / 20) * 100)) || 0;

    // Urutkan menjadi dari terbaru ke terlama dan ambil 5 teratas
    const historyArray = Array.from(groupedAbsen.values())
      .sort((a, b) => b.rawDate.localeCompare(a.rawDate))
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        attendanceRate,
        isVerified: !!isVerified,
        history: historyArray
      }
    });
  } catch (error) {
    console.error("Error fetching user dashboard:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
