import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId, date, status } = await request.json();

    if (!userId || !date || !status) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    if (status !== "Izin" && status !== "Sakit") {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    // Buat waktu scan di set ke jam 08:00 pagi WIB pada tanggal yang dipilih
    // format date diharapkan "YYYY-MM-DD"
    // WIB adalah UTC+7, sehingga UTC 01:00:00 adalah jam 08:00:00 WIB
    const scanTime = new Date(`${date}T01:00:00.000Z`);

    const absenRecord = await prisma.absen.create({
      data: {
        user_id: userId,
        device_loc: "Manual Input (Admin)",
        status: status,
        confidence_score: 1.0,
        scan_time: scanTime
      }
    });

    return NextResponse.json({ success: true, data: absenRecord });
  } catch (error) {
    console.error("Error creating manual izin:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal" }, { status: 500 });
  }
}
