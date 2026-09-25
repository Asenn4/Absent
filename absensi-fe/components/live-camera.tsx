"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ScanFace, Activity, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
          video: { facingMode: "user" } 
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

  // Proses scan berkala
  useEffect(() => {
    if (isSuccess) return;

    const scanInterval = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || isScanning || isSuccess) return;
      
      const video = videoRef.current;
      if (video.readyState !== 4) return; // Tunggu video siap

      setIsScanning(true);
      setStatusMessage("MEMPROSES BINGKAI...");

      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
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
                setStatusMessage(`COCOK: ${data.user.name} (${data.status})`);
                setIsSuccess(true);
                
                if (onLog) {
                  onLog(scanMode, data.user.name, data.status);
                }

                // Auto reset 3.5 detik agar siap untuk orang berikutnya (Kiosk mode)
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
                  setStatusMessage(prev => prev.startsWith("COCOK") ? prev : "MENUNGGU SUBJEK");
                }, 2500);
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
        }, "image/jpeg", 0.8);
      }
    }, 3000); // Lakukan scan setiap 3 detik

    return () => clearInterval(scanInterval);
  }, [isScanning, isSuccess, onLog, scanMode]);

  return (
    <Card className="bg-white border border-blue-100 shadow-md overflow-hidden transition-all duration-500 relative group rounded-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-blue-100/30"></div>
      
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-blue-100 bg-white/80 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Camera className="w-5 h-5 text-blue-400 z-10 relative" />
            <div className="absolute inset-0 bg-blue-400 blur-sm opacity-40"></div>
          </div>
          <CardTitle className="text-sm font-mono tracking-wider text-blue-900">SYS.CAM_01</CardTitle>
        </div>
        <div className="flex items-center gap-3 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          <span className="relative flex h-2.5 w-2.5">
            <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75", isSuccess ? "bg-green-500 animate-none" : "bg-yellow-500 animate-ping")}></span>
            <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", isSuccess ? "bg-green-400" : "bg-yellow-400")}></span>
          </span>
          <span className={cn("text-[10px] font-mono tracking-widest font-bold", isSuccess ? "text-green-700" : "text-blue-700")}>
            {isSuccess ? "VERIFIED" : "REC (GATE A)"}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 relative z-10">
        <div className="relative w-full aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
          
          {/* Feed Video Asli */}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={cn("absolute inset-0 w-full h-full object-cover transition-opacity duration-700", isSuccess ? "opacity-40" : "opacity-80")}
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Grid Pattern Latar Belakang */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.15)_1px,transparent_1px)] bg-[size:30px_30px]" />

          {/* Target Tengah */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 opacity-30 pointer-events-none flex items-center justify-center">
            <div className="w-full h-[1px] bg-blue-400 absolute"></div>
            <div className="w-[1px] h-full bg-blue-400 absolute"></div>
            <div className="w-24 h-24 rounded-full border border-blue-400 absolute"></div>
          </div>

          {/* Efek Radar Menyapu */}
          {!isSuccess && (
             <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] opacity-70 animate-[scan_3s_ease-in-out_infinite]" />
          )}

          {/* Overlay Status */}
          <div className="absolute z-20 backdrop-blur-sm bg-black/40 px-6 py-4 rounded-2xl border border-white/10 flex flex-col items-center gap-3 pointer-events-none">
             {isSuccess ? (
                <CheckCircle2 className="w-12 h-12 text-green-400 animate-pulse drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
             ) : (
                <ScanFace className={cn("w-12 h-12 transition-all duration-500", isScanning ? "text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse scale-110" : "text-blue-200/40")} />
             )}
             <p className={cn("text-xs font-mono tracking-widest font-bold drop-shadow-md text-center", isSuccess ? "text-green-400" : (isScanning ? "text-blue-300" : "text-white/80"))}>
                {statusMessage}
             </p>
          </div>

          {/* Overlay Data Sistem (Atribut Kosmetik Keren) */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none z-30">
            <div className="flex flex-col gap-1 text-[9px] font-mono text-white/80 tracking-widest font-bold">
              <div className="flex items-center gap-2">
                <Activity className={cn("w-3 h-3", isSuccess ? "text-green-400" : "animate-pulse text-blue-400")} />
                <span className="bg-black/50 px-1 py-0.5 rounded border border-white/10 backdrop-blur-sm">NVIDIA_JETSON_NANO_AI</span>
              </div>
              <div className="flex gap-2 px-1">
                <span className="text-white/60">FR_ENGINE: v4.2.1</span>
                <span className={cn(
                  "text-white/80",
                  fps >= 30 ? "text-green-400" : fps >= 15 ? "text-yellow-400" : "text-red-400"
                )}>
                  FPS: {fps}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-1 items-end text-[9px] font-mono text-white/80 tracking-widest font-bold">
               <span className="bg-black/50 px-1 py-0.5 rounded border border-white/10 backdrop-blur-sm">LAT: {latency > 0 ? `${latency}ms` : "---ms"}</span>
               <span className="px-1 text-white/60">{currentTime || "MENYINKRONKAN..."}</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* Panel Pilihan Mode Masuk / Keluar */}
      <div className="border-t border-blue-100 bg-blue-50/30 p-3 relative z-10 flex items-center justify-center gap-4">
        <button
          onClick={() => setScanMode("checkIn")}
          disabled={isSuccess}
          className={cn(
            "px-6 py-2 rounded-lg font-mono text-xs tracking-widest font-bold transition-all duration-300 border disabled:opacity-50",
            scanMode === "checkIn" 
              ? "bg-green-100 text-green-700 border-green-300 shadow-sm" 
              : "bg-white text-slate-500 border-blue-100 hover:bg-blue-50 shadow-sm hover:text-blue-600"
          )}
        >
          MODE: MASUK
        </button>
        <button
          onClick={() => setScanMode("checkOut")}
          disabled={isSuccess}
          className={cn(
            "px-6 py-2 rounded-lg font-mono text-xs tracking-widest font-bold transition-all duration-300 border disabled:opacity-50",
            scanMode === "checkOut" 
              ? "bg-orange-100 text-orange-700 border-orange-300 shadow-sm" 
              : "bg-white text-slate-500 border-blue-100 hover:bg-blue-50 shadow-sm hover:text-blue-600"
          )}
        >
          MODE: KELUAR
        </button>
      </div>
    </Card>
  );
}
