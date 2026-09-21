import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const registrations = await prisma.faceRegistration.findMany({
      where: { status: "pending" },
      include: {
        user: {
          select: {
            nama: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { created_at: "asc" }
    });
    
    return NextResponse.json({ success: true, data: registrations });
  } catch (error) {
    console.error("Error fetching pending registrations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
