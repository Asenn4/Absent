"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, ScanFace, Activity, CheckCircle2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LiveCameraProps {
  onLog?: (mode: "checkIn" | "checkOut", name: string, status?: string) => void;
}

export function LiveCamera({ onLog }: LiveCameraProps = {}) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<"checkIn" | "checkOut">("checkIn");
  const [currentTime, setCurrentTime] = useState("");
  const [statusMessage, setStatusMessage] = useState("MENUNGGU SUBJEK");
  const [isSuccess, setIsSuccess] = useState(false);
  const [latency, setLatency] = useState(0);
  const [fps, setFps] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // FPS Counter
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const calculateFPS = () => {
      const now = performance.now();
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }
      animationFrameId = requestAnimationFrame(calculateFPS);
    };

    animationFrameId = requestAnimationFrame(calculateFPS);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  // Setup Kamera
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
      } catch (err) {
        console.error("Gagal mengakses kamera:", err);
        setStatusMessage("KAMERA TIDAK TERSEDIA");
      }
    }
    
    setupCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Fungsi Scan Wajah (Bisa dipanggil otomatis maupun via tombol manual)
  const performScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isScanning || isSuccess) return;
    
    const video = videoRef.current;
    if (video.readyState !== 4) return;

    setIsScanning(true);
    setStatusMessage("MEMINDAI WAJAH...");

    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(async (blob) => {
        if (blob) {
          const startTime = performance.now();
          try {
            const formData = new FormData();
            formData.append("photo", blob, "face.jpg");
            formData.append("scanMode", scanMode);

            const response = await fetch("/api/absen", {
              method: "POST",
              body: formData,
            });

            setLatency(Math.round(performance.now() - startTime));

            if (response.ok) {
              const data = await response.json();
              const prefix = data.alreadyChecked ? "SUDAH ABSEN" : "COCOK";
              setStatusMessage(`${prefix}: ${data.user.name} (${data.status})`);
              setIsSuccess(true);
              
              if (onLog) {
                onLog(scanMode, data.user.name, data.status);
              }

              // Auto-reset setelah 3.5 detik agar siap untuk orang berikutnya
              setTimeout(() => {
                setIsSuccess(false);
                setStatusMessage("MENUNGGU SUBJEK");
              }, 3500);

            } else {
              try {
                const errorData = await response.json();
                setStatusMessage(errorData.error ? errorData.error.toUpperCase() : "TIDAK DIKENALI");
              } catch {
                setStatusMessage("TIDAK DIKENALI");
              }
              
              setTimeout(() => {
                setStatusMessage(prev => (prev.startsWith("COCOK") || prev.startsWith("SUDAH")) ? prev : "MENUNGGU SUBJEK");
              }, 3000);
            }
          } catch (error) {
            console.error(error);
            setLatency(Math.round(performance.now() - startTime));
            setStatusMessage("ERROR JARINGAN");

            setTimeout(() => {
              setStatusMessage("MENUNGGU SUBJEK");
            }, 2500);
          }
        }
        setIsScanning(false);
      }, "image/jpeg", 0.85);
    }
  }, [isScanning, isSuccess, onLog, scanMode]);

  // Auto scan setiap 3.5 detik jika tidak sedang sukses atau memproses
  useEffect(() => {
    if (isSuccess) return;

    const scanInterval = setInterval(() => {
      performScan();
    }, 3500);

    return () => clearInterval(scanInterval);
  }, [isSuccess, performScan]);

  return (
    <Card className="bg-white border border-blue-100 shadow-md hover:shadow-lg overflow-hidden transition-all duration-300 relative group rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-blue-100 bg-slate-50/50 relative z-10 px-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-sm font-extrabold tracking-tight text-blue-950">KAMERA TERMINAL</CardTitle>
            <p className="text-[11px] font-mono text-blue-600 font-semibold">NVIDIA JETSON AI • CAM_01</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 bg-blue-50/80 px-3 py-1.5 rounded-full border border-blue-200/80 shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75", isSuccess ? "bg-emerald-500 animate-none" : "bg-blue-500 animate-ping")}></span>
            <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", isSuccess ? "bg-emerald-500" : "bg-blue-600")}></span>
          </span>
          <span className={cn("text-[11px] font-mono font-bold tracking-wider", isSuccess ? "text-emerald-700" : "text-blue-800")}>
            {isSuccess ? "VERIFIKASI SUKSES" : "SIAP SCAN (STANDBY)"}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 relative z-10">
        <div className="relative w-full aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
          
          {/* Feed Video Asli */}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={cn("absolute inset-0 w-full h-full object-cover transition-opacity duration-700", isSuccess ? "opacity-50" : "opacity-90")}
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Grid Pattern Latar Belakang */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.15)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          {/* Target Face Guide Tengah */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-56 rounded-3xl border-2 border-dashed border-blue-400/50 pointer-events-none flex items-center justify-center">
            <div className="w-full h-[1px] bg-blue-400/20 absolute"></div>
            <div className="w-[1px] h-full bg-blue-400/20 absolute"></div>
          </div>

          {/* Efek Radar Menyapu */}
          {!isSuccess && (
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.9)] opacity-80 animate-[scan_3s_ease-in-out_infinite]" />
          )}

          {/* Overlay Status Box */}
          <div className="absolute z-20 backdrop-blur-md bg-slate-950/60 px-6 py-3.5 rounded-2xl border border-white/20 flex flex-col items-center gap-2 shadow-2xl pointer-events-none max-w-[85%]">
             {isSuccess ? (
                <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
             ) : (
                <ScanFace className={cn("w-10 h-10 transition-all duration-300", isScanning ? "text-yellow-400 animate-pulse scale-110" : "text-blue-300")} />
             )}
             <p className={cn("text-xs font-mono tracking-wider font-extrabold drop-shadow text-center", isSuccess ? "text-emerald-300" : (isScanning ? "text-yellow-300" : "text-white"))}>
                {statusMessage}
             </p>
          </div>

          {/* Overlay Data Teknis */}
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end pointer-events-none z-30">
            <div className="flex flex-col gap-1 text-[9px] font-mono text-white/90 font-bold">
              <div className="flex items-center gap-2">
                <Activity className={cn("w-3 h-3", isSuccess ? "text-emerald-400" : "animate-pulse text-blue-400")} />
                <span className="bg-slate-900/80 px-2 py-0.5 rounded border border-white/10 backdrop-blur-sm">AI ENGINE: BUFFALO_L</span>
              </div>
              <div className="flex gap-2 px-1">
                <span className="text-white/70">FPS: {fps}</span>
                <span className="text-white/70">LATENCY: {latency > 0 ? `${latency}ms` : "---"}</span>
              </div>
            </div>
            
            <div className="text-[10px] font-mono text-yellow-400 font-extrabold bg-slate-900/80 px-2 py-1 rounded border border-white/10 backdrop-blur-sm">
               {currentTime || "MENYINKRONKAN..."}
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* Panel Kontrol Mode & Tombol Trigger Scan Manual */}
      <div className="border-t border-blue-100 bg-slate-50/70 p-4 relative z-10 flex flex-wrap items-center justify-between gap-3">
        {/* Pilihan Mode Masuk / Keluar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScanMode("checkIn")}
            disabled={isSuccess || isScanning}
            className={cn(
              "px-4 py-2 rounded-xl font-bold text-xs tracking-wide transition-all duration-200 border disabled:opacity-50",
              scanMode === "checkIn" 
                ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20" 
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
            )}
          >
            MODE: MASUK
          </button>
          <button
            onClick={() => setScanMode("checkOut")}
            disabled={isSuccess || isScanning}
            className={cn(
              "px-4 py-2 rounded-xl font-bold text-xs tracking-wide transition-all duration-200 border disabled:opacity-50",
              scanMode === "checkOut" 
                ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20" 
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
            )}
          >
            MODE: KELUAR
          </button>
        </div>

        {/* Tombol Manual Ambil Foto & Scan */}
        <Button
          onClick={performScan}
          disabled={isScanning || isSuccess}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2 h-auto rounded-xl shadow-md shadow-blue-600/25 flex items-center gap-2 transition-all active:scale-95"
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <ScanFace className="w-4 h-4 text-yellow-300" />
              <span>Scan Wajah Sekarang</span>
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
