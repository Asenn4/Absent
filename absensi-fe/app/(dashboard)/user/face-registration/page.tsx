"use client"

import { useState } from "react"
import { Camera, Upload, CheckCircle2 } from "lucide-react"

export default function FaceRegistrationPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      
      // Buat preview
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      formData.append('photo', file)

      const response = await fetch('/api/face-registration', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        setIsSuccess(true)
      } else {
        alert("Gagal mendaftarkan wajah. Silakan coba lagi.")
      }
    } catch (error) {
      console.error("Error submitting face:", error)
      alert("Terjadi kesalahan sistem.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[70vh]">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Pengajuan Berhasil!</h2>
        <p className="text-muted-foreground max-w-md">
          Foto wajah Anda telah berhasil dikirim ke Admin. Silakan tunggu proses verifikasi selesai sebelum Anda dapat menggunakan fitur absensi AI.
        </p>
        <button 
          onClick={() => window.location.href = '/user/dashboard'}
          className="mt-8 bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          Kembali ke Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Pendaftaran Wajah</h1>
        <p className="text-muted-foreground">
          Daftarkan wajah Anda untuk digunakan pada sistem absensi otomatis. Pastikan foto terlihat jelas dan memiliki pencahayaan yang baik.
        </p>
      </div>

      <div className="bg-card border rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-foreground">
              Unggah Foto Wajah
            </label>
            
            {preview ? (
              <div className="relative rounded-lg border-2 border-dashed border-border overflow-hidden h-64 flex items-center justify-center bg-muted/30">
                <img src={preview} alt="Preview" className="h-full object-contain" />
                <button 
                  type="button"
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="absolute top-2 right-2 bg-background/80 backdrop-blur text-sm px-3 py-1 rounded-md border shadow-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  Ganti Foto
                </button>
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors">
                <label htmlFor="photo-upload" className="flex flex-col items-center justify-center h-64 cursor-pointer">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                    <Camera className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-medium mb-1">Klik untuk mengunggah foto</p>
                  <p className="text-xs text-muted-foreground">Atau ambil langsung dari kamera Anda (Maks. 5MB)</p>
                  <input 
                    id="photo-upload" 
                    type="file" 
                    accept="image/*" 
                    capture="user" // Membuka kamera depan di HP
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-300">
            <strong>Catatan Penting:</strong>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Jangan menggunakan kacamata gelap atau masker.</li>
              <li>Pastikan wajah berada tepat di tengah (center).</li>
              <li>Hindari pencahayaan dari belakang (backlight) yang membuat wajah gelap.</li>
            </ul>
          </div>

          <button 
            type="submit" 
            disabled={!file || isSubmitting}
            className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4 animate-bounce" /> Mengunggah...
              </span>
            ) : (
              "Kirim Pengajuan"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
