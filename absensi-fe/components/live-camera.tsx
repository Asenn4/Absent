"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, ScanFace, Activity, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
          const formData = new FormData();
          formData.append("file", blob, "scan.jpg");
          
          try {
            const res = await fetch("/api/absen", {
              method: "POST",
              body: formData,
            });
            const data = await res.json();
            
            setLatency(Math.round(performance.now() - startTime));
            
            if (data.success) {
              setIsSuccess(true);
              setStatusMessage("VERIFIKASI BERHASIL");
              
              if (onLog) {
                onLog(scanMode, data.data.name, data.data.status);
              }

              setTimeout(() => {
                setIsSuccess(false);
                setStatusMessage("MENUNGGU SUBJEK");
              }, 3000);
            } else {
              setStatusMessage(data.error?.toUpperCase() || "WAJAH TIDAK DIKENALI");
              setTimeout(() => {
                setStatusMessage("MENUNGGU SUBJEK");
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

  useEffect(() => {
    if (isSuccess) return;

    const scanInterval = setInterval(() => {
      performScan();
    }, 3500);

    return () => clearInterval(scanInterval);
  }, [isSuccess, performScan]);

  return (
    <div className="border border-border bg-card flex flex-col">
      <div className="flex flex-row items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-muted-foreground" />
          <div>
            <h3 className="text-xs font-semibold text-foreground tracking-widest uppercase">Kamera Terminal</h3>
            <p className="text-[10px] font-mono text-muted-foreground">JETSON AI CAM_01</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 border border-border px-2 py-1">
          <span className={`w-1.5 h-1.5 ${isSuccess ? "bg-primary" : "bg-muted-foreground"}`}></span>
          <span className={`text-[10px] font-mono font-bold tracking-widest uppercase ${isSuccess ? "text-primary" : "text-muted-foreground"}`}>
            {isSuccess ? "SUKSES" : "STANDBY"}
          </span>
        </div>
      </div>
      
      <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden border-b border-border">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isSuccess ? "opacity-50" : "opacity-90"}`}
        />
        <canvas ref={canvasRef} className="hidden" />

        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-48 border border-white/20 pointer-events-none flex items-center justify-center">
          <div className="w-4 h-4 border-t border-l border-primary absolute top-0 left-0"></div>
          <div className="w-4 h-4 border-t border-r border-primary absolute top-0 right-0"></div>
          <div className="w-4 h-4 border-b border-l border-primary absolute bottom-0 left-0"></div>
          <div className="w-4 h-4 border-b border-r border-primary absolute bottom-0 right-0"></div>
        </div>

        {!isSuccess && (
           <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/80 animate-[scan_3s_ease-in-out_infinite]" />
        )}

        <div className="absolute z-20 bg-black/60 px-4 py-2 border border-white/20 flex flex-col items-center gap-1 pointer-events-none">
           {isSuccess ? (
              <CheckCircle2 className="w-6 h-6 text-primary" />
           ) : (
              <ScanFace className={`w-6 h-6 transition-all duration-300 ${isScanning ? "text-primary" : "text-muted-foreground"}`} />
           )}
           <p className={`text-[10px] font-mono tracking-widest font-bold text-center ${isSuccess ? "text-primary" : (isScanning ? "text-primary" : "text-white")}`}>
              {statusMessage}
           </p>
        </div>

        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end pointer-events-none z-30">
          <div className="flex flex-col gap-0.5 text-[9px] font-mono text-white/90">
            <div className="flex items-center gap-1.5 bg-black/80 px-1.5 py-0.5 border border-white/10">
              <Activity className={`w-2.5 h-2.5 ${isSuccess ? "text-primary" : "text-muted-foreground"}`} />
              <span>ENGINE: BUFFALO_L</span>
            </div>
            <div className="flex gap-1">
              <span className="bg-black/80 px-1.5 py-0.5 border border-white/10">FPS:{fps}</span>
              <span className="bg-black/80 px-1.5 py-0.5 border border-white/10">LAT:{latency > 0 ? latency : "0"}ms</span>
            </div>
          </div>
          
          <div className="text-[10px] font-mono text-primary font-bold bg-black/80 px-1.5 py-0.5 border border-white/10">
             {currentTime || "SYNC..."}
          </div>
        </div>
      </div>
      
      <div className="p-3 bg-card flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setScanMode("checkIn")}
            disabled={isSuccess || isScanning}
            className={`flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-mono font-bold tracking-widest uppercase border transition-colors ${
              scanMode === "checkIn" 
                ? "bg-primary text-primary-foreground border-primary" 
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            IN
          </button>
          <button
            onClick={() => setScanMode("checkOut")}
            disabled={isSuccess || isScanning}
            className={`flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-mono font-bold tracking-widest uppercase border transition-colors ${
              scanMode === "checkOut" 
                ? "bg-primary text-primary-foreground border-primary" 
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            OUT
          </button>
        </div>

        <Button
          onClick={performScan}
          disabled={isScanning || isSuccess}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-[10px] font-bold px-4 h-8 uppercase tracking-widest gap-2"
        >
          {isScanning ? (
            <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> PROSES...</>
          ) : (
            <><ScanFace className="w-3.5 h-3.5" /> MANUAL SCAN</>
          )}
        </Button>
      </div>
    </div>
  );
}
