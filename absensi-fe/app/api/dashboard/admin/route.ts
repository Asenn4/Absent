import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const totalUsers = await prisma.user.count({
      where: { role: "user" }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAbsen = await prisma.absen.findMany({
      where: {
        scan_time: {
          gte: today
        }
      }
    });

    let present = 0;
    let late = 0;
    
    // Asumsi 1 user 1 absen per hari untuk kemudahan.
    // Jika user absen masuk dan keluar, kita ambil status masuknya saja.
    // Di sini kita hitung jumlah record saja.
    const uniqueUserIds = new Set();
    
    todayAbsen.forEach(a => {
      if (!uniqueUserIds.has(a.user_id)) {
        uniqueUserIds.add(a.user_id);
        if (a.status === "Hadir") present++;
        else if (a.status === "Terlambat") late++;
      }
    });

    const absent = Math.max(0, totalUsers - present - late);

    // Dummy data untuk chart mingguan karena ini membutuhkan query aggregate yang lebih kompleks
    const trendData = [
      { name: "Mon", present: 45, late: 3, absent: 2 },
      { name: "Tue", present: 48, late: 1, absent: 1 },
      { name: "Wed", present: 42, late: 5, absent: 3 },
      { name: "Thu", present: 47, late: 2, absent: 1 },
      { name: "Fri", present, late, absent },
    ];

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        present,
        late,
        absent,
        trendData
      }
    });
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
