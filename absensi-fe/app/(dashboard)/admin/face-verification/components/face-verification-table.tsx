"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, X, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function FaceVerificationTable({ requests }: { requests: any[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const router = useRouter()

  const handleProcess = async (id: string, action: "approve" | "reject") => {
    try {
      // Tombol disable sementara logic bisa ditambahkan nanti
      const res = await fetch(`/api/face-verification/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (!res.ok) {
        const data = await res.json()
        alert(`Gagal memproses: ${data.error || 'Server error'}`)
        return
      }

      alert(action === 'approve' ? 'Data wajah berhasil diproses!' : 'Pengajuan ditolak.')
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Terjadi kesalahan jaringan.")
    }
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader className="bg-blue-50/50 border-b border-blue-100">
          <TableRow>
            <TableHead className="font-semibold text-blue-900">Pengguna</TableHead>
            <TableHead className="font-semibold text-blue-900">Waktu Pengajuan</TableHead>
            <TableHead className="font-semibold text-blue-900">Foto Wajah</TableHead>
            <TableHead className="font-semibold text-blue-900">Status</TableHead>
            <TableHead className="font-semibold text-blue-900 text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req) => (
            <TableRow key={req.id} className="hover:bg-blue-50/30">
              <TableCell>
                <div className="font-medium text-blue-900">{req.user.nama}</div>
                <div className="text-xs text-blue-800/70">{req.user.email}</div>
              </TableCell>
              <TableCell className="text-blue-800/70">
                {req.created_at.toLocaleDateString("id-ID", {
                  day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                })}
              </TableCell>
              <TableCell>
                <div className="relative group inline-block border-2 border-blue-200 hover:border-blue-400 rounded-md transition-colors overflow-hidden">
                  <img 
                    src={req.photo_url} 
                    alt="Foto Wajah" 
                    className="w-12 h-12 object-cover cursor-pointer"
                    onClick={() => setSelectedPhoto(req.photo_url)}
                  />
                  <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center pointer-events-none transition-opacity cursor-pointer" onClick={() => setSelectedPhoto(req.photo_url)}>
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-yellow-100 text-blue-900 border-yellow-300 font-medium px-2 py-0.5">
                  {req.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button 
                  size="sm"
                  onClick={() => handleProcess(req.id, "approve")}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Terima & Proses
                </Button>
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => handleProcess(req.id, "reject")}
                  className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Tolak
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {requests.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-blue-800/50">
                Tidak ada permintaan verifikasi wajah saat ini.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Modal View Image */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-lg w-full bg-card rounded-xl shadow-lg border p-2 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-2 mb-2">
              <h3 className="font-medium text-foreground">Detail Foto Wajah</h3>
              <button onClick={() => setSelectedPhoto(null)} className="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <img src={selectedPhoto} alt="Detail Wajah" className="w-full h-auto rounded-lg" />
          </div>
        </div>
      )}
    </div>
  )
}
