import prisma from "@/lib/prisma"
import { FaceVerificationTable } from "./components/face-verification-table"

export const metadata = {
  title: "Verifikasi Wajah | Admin",
  description: "Kelola permintaan verifikasi wajah user",
}

export default async function FaceVerificationPage() {
  const requests = await prisma.faceRegistration.findMany({
    where: { status: "pending" },
    include: {
      user: true
    },
    orderBy: {
      created_at: 'desc'
    }
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Verifikasi Wajah</h1>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">proses pengajuan data wajah untuk sistem absensi AI</p>
      </div>

      <div className="border border-border bg-card overflow-hidden">
        <FaceVerificationTable requests={requests} />
      </div>
    </div>
  )
}
