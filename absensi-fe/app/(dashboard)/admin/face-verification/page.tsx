import prisma from "@/lib/prisma"
import { FaceVerificationTable } from "./components/face-verification-table"
import { Card } from "@/components/ui/card"

export const metadata = {
  title: "Verifikasi Wajah | Admin",
  description: "Kelola permintaan verifikasi wajah user",
}

export default async function FaceVerificationPage() {
  // Ambil antrean verifikasi wajah yang berstatus "pending"
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Verifikasi Wajah</h1>
          <p className="text-blue-800/60 mt-1">
            Kelola dan proses pengajuan data wajah dari pengguna untuk sistem absensi AI.
          </p>
        </div>
      </div>
      
      <Card className="bg-white border-none shadow-sm overflow-hidden">
        <FaceVerificationTable requests={requests} />
      </Card>
    </div>
  )
}
