import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs";
import { join } from "path";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { action } = await request.json();
    const { id } = await params;

    if (!id || !action) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const registration = await prisma.faceRegistration.findUnique({
      where: { id }
    });

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    if (action === "reject") {
      await prisma.faceRegistration.update({
        where: { id },
        data: { status: "rejected" }
      });
      return NextResponse.json({ success: true, message: "Rejected" });
    }

    if (action === "approve") {
      // 1. Get the physical file path
      const publicPath = join(process.cwd(), "public");
      const filePath = join(publicPath, registration.photo_url);

      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "Photo file not found on server" }, { status: 404 });
      }

      // 2. Read the file to send to FastAPI
      const fileBuffer = fs.readFileSync(filePath);
      const blob = new Blob([fileBuffer], { type: "image/jpeg" });
      
      const formData = new FormData();
      formData.append("file", blob, "face.jpg");
      formData.append("user_id", registration.user_id);

      // 3. Send to FastAPI
      try {
        const fastApiResponse = await fetch("http://localhost:8000/api/train-face", {
          method: "POST",
          body: formData,
        });

        if (!fastApiResponse.ok) {
          const errorData = await fastApiResponse.text();
          console.error("FastAPI error:", errorData);
          return NextResponse.json({ error: "Failed to process face in AI service" }, { status: 500 });
        }

        const data = await fastApiResponse.json();
        
        // 4. Save embedding to User
        await prisma.user.update({
          where: { id: registration.user_id },
          data: {
            face_embed: JSON.stringify(data.embedding || []), // Menyimpan array sebagai string JSON
          }
        });

        // 5. Update status
        await prisma.faceRegistration.update({
          where: { id },
          data: { status: "approved" }
        });

        return NextResponse.json({ success: true, message: "Approved and trained" });
      } catch (fastApiError) {
        console.error("Error communicating with FastAPI:", fastApiError);
        return NextResponse.json({ error: "Could not connect to AI service" }, { status: 502 });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in face verification:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
