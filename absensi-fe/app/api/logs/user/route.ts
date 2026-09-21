import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("user_id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Tidak ada sesi aktif" }, { status: 401 });
    }

    const logs = await prisma.absen.findMany({
      where: { user_id: userId },
      orderBy: { scan_time: "desc" },
    });
    
    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error("Error fetching user logs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
