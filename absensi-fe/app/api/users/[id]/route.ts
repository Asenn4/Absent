import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { nama, email, role } = await request.json();

    const user = await prisma.user.update({
      where: { id },
      data: { nama, email, role }
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Hapus juga face registration dan absen terkait user ini jika ada cascade delete
    // Prisma biasanya menangani cascade jika diset, jika tidak kita harus hapus manual.
    // Di schema.prisma tidak ada onDelete: Cascade, jadi kita harus hapus manual.
    await prisma.faceRegistration.deleteMany({ where: { user_id: id } });
    await prisma.absen.deleteMany({ where: { user_id: id } });

    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal" }, { status: 500 });
  }
}
