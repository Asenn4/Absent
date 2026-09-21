import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const logs = await prisma.absen.findMany({
      orderBy: { scan_time: "desc" },
      include: {
        user: {
          select: {
            nama: true,
            email: true,
            role: true
          }
        }
      }
    });
    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
