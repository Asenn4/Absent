"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Camera, Upload, CheckCircle2, X, SwitchCamera, FlipHorizontal } from "lucide-react"

type InputMode = "choose" | "upload" | "camera"

export default function FaceRegistrationPage() {
  const [mode, setMode] = useState<InputMode>("choose")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Kamera states
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")
  const [isMirrored, setIsMirrored] = useState(true)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Mulai kamera
  const startCamera = useCallback(async (facing: "user" | "environment") => {
    setCameraError(null)
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setCameraActive(true)
    } catch (err: unknown) {
      const error = err as Error
      if (error.name === "NotAllowedError") {
        setCameraError("Akses kamera ditolak. Izinkan akses kamera di browser Anda.")
      } else if (error.name === "NotFoundError") {
        setCameraError("Kamera tidak ditemukan pada perangkat ini.")
      } else {
        setCameraError("Gagal membuka kamera. Coba lagi.")
      }
      setCameraActive(false)
    }
  }, [])

  // Hentikan kamera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }, [])

  const openCamera = () => {
    setMode("camera")
    startCamera(facingMode)
  }

  const closeCamera = () => {
    stopCamera()
    setMode("choose")
    setCameraError(null)
  }

  const toggleFacing = () => {
    const next = facingMode === "user" ? "environment" : "user"
    setFacingMode(next)
    startCamera(next)
  }

  // Ambil foto dari video
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (isMirrored && facingMode === "user") {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, 0, 0)

    canvas.toBlob((blob) => {
      if (!blob) return
      const capturedFile = new File([blob], "kamera-wajah.jpg", { type: "image/jpeg" })
      setFile(capturedFile)
      setPreview(canvas.toDataURL("image/jpeg"))
      stopCamera()
      setMode("upload")
    }, "image/jpeg", 0.92)
  }

  // Upload file biasa
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target?.result as string)
      reader.readAsDataURL(selectedFile)
      setMode("upload")
    }
  }

  const resetPhoto = () => {
    setFile(null)
    setPreview(null)
    setMode("choose")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("photo", file)

      const response = await fetch("/api/face-registration", {
        method: "POST",
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

  // Cleanup saat unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

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
          onClick={() => (window.location.href = "/user/dashboard")}
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
              Foto Wajah
            </label>

            {/* PREVIEW setelah foto diambil / diunggah */}
            {preview && mode === "upload" ? (
              <div className="relative rounded-lg border-2 border-dashed border-border overflow-hidden h-72 flex items-center justify-center bg-muted/30">
                <img src={preview} alt="Preview" className="h-full object-contain" />
                <button
                  type="button"
                  onClick={resetPhoto}
                  className="absolute top-2 right-2 bg-background/80 backdrop-blur text-sm px-3 py-1 rounded-md border shadow-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  Ganti Foto
                </button>
              </div>

            ) : mode === "camera" ? (
              /* MODE KAMERA LIVE */
              <div className="rounded-lg border-2 border-border overflow-hidden bg-black relative">
                {cameraError ? (
                  <div className="h-72 flex flex-col items-center justify-center text-center px-6 gap-3">
                    <Camera className="w-10 h-10 text-muted-foreground" />
                    <p className="text-sm text-destructive">{cameraError}</p>
                    <button
                      type="button"
                      onClick={() => startCamera(facingMode)}
                      className="text-sm px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      Coba Lagi
                    </button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-72 object-cover"
                      style={{
                        transform: isMirrored && facingMode === "user" ? "scaleX(-1)" : "none",
                      }}
                    />
                    {/* Panduan oval wajah */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-44 h-56 border-2 border-white/60 rounded-full opacity-60" />
                    </div>
                    {/* Kontrol bawah */}
                    <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-5">
                      <button
                        type="button"
                        onClick={() => setIsMirrored((m) => !m)}
                        title="Cermin"
                        className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                      >
                        <FlipHorizontal className="w-5 h-5" />
                      </button>
                      {/* Tombol shutter */}
                      <button
                        type="button"
                        onClick={capturePhoto}
                        disabled={!cameraActive}
                        title="Ambil Foto"
                        className="w-16 h-16 bg-white border-4 border-white/80 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
                      >
                        <span className="sr-only">Ambil Foto</span>
                      </button>
                      <button
                        type="button"
                        onClick={toggleFacing}
                        title="Ganti Kamera"
                        className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                      >
                        <SwitchCamera className="w-5 h-5" />
                      </button>
                    </div>
                    {/* Tombol tutup */}
                    <button
                      type="button"
                      onClick={closeCamera}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                      title="Tutup Kamera"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

            ) : (
              /* MODE PILIH: upload atau kamera */
              <div className="rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors">
                <div className="grid grid-cols-2 divide-x divide-border h-64">
                  {/* Kiri: upload file */}
                  <label
                    htmlFor="photo-upload"
                    className="flex flex-col items-center justify-center cursor-pointer hover:bg-muted/40 transition-colors rounded-l-lg gap-3 p-4"
                  >
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Unggah Foto</p>
                      <p className="text-xs text-muted-foreground mt-0.5">dari galeri / file (Maks. 5MB)</p>
                    </div>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>

                  {/* Kanan: buka kamera */}
                  <button
                    type="button"
                    onClick={openCamera}
                    className="flex flex-col items-center justify-center hover:bg-muted/40 transition-colors rounded-r-lg gap-3 p-4"
                  >
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Ambil dari Kamera</p>
                      <p className="text-xs text-muted-foreground mt-0.5">buka kamera langsung</p>
                    </div>
                  </button>
                </div>
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
            className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Upload className="w-4 h-4 animate-bounce" /> Mengunggah...
              </>
            ) : (
              "Kirim Pengajuan"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
