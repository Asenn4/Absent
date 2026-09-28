"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { LiveCamera } from "@/components/live-camera";
import { 
  ScanFace, 
  LogIn, 
  Clock, 
  Users, 
  CheckCircle2, 
  Activity,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AttendanceRecord {
  id: string;
  user_id: string;
  scan_time: string;
  status: string;
  confidence_score: number;
  photo_url?: string;
  user?: {
    nama: string;
    email: string;
    role: string;
  };
}

export default function KioskPage() {
  const [logs, setLogs] = useState<AttendanceRecord[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [lastNotification, setLastNotification] = useState<{
    name: string;
    mode: string;
    status: string;
    time: string;
  } | null>(null);

  const playBeep = useCallback((isSuccess = true) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (isSuccess) {
        osc.type = "sine";
        osc.frequency.setValueAtTime(784, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const cookies = document.cookie.split(';');
    const hasAuth = cookies.some(c => c.trim().startsWith('auth_role=') || c.trim().startsWith('user_id='));
    if (hasAuth) {
      document.cookie = "auth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WIB"
      );
      setCurrentDate(
        now.toLocaleDateString("id-ID", {
          timeZone: "Asia/Jakarta",
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/logs");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setLogs(data.data.slice(0, 10));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    const pollInterval = setInterval(fetchLogs, 8000);
    return () => clearInterval(pollInterval);
  }, [fetchLogs]);

  const handleLog = (mode: "checkIn" | "checkOut", name: string, status?: string) => {
    playBeep(true);
    const nowTime = new Date().toLocaleTimeString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
    });

    setLastNotification({
      name,
      mode: mode === "checkIn" ? "Masuk" : "Keluar",
      status: status || (mode === "checkIn" ? "Hadir" : "Pulang"),
      time: nowTime,
    });

    setTimeout(() => {
      setLastNotification(null);
    }, 5000);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Terlambat": return "text-amber-500 border-amber-500/30";
      case "Pulang": return "text-muted-foreground border-border";
      default: return "text-primary border-primary/30";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary flex items-center justify-center">
            <ScanFace className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold font-mono uppercase tracking-widest">Jetson_Attend <span className="text-primary font-bold">Kiosk</span></h1>
            <p className="text-[10px] font-mono text-muted-foreground">AI Face Verification Terminal</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <div className="text-lg font-mono font-bold text-foreground leading-none mb-1 flex items-center gap-2 justify-end">
              <Clock className="w-4 h-4 text-primary" /> {currentTime}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              {currentDate}
            </div>
          </div>
          <div className="w-px h-8 bg-border hidden sm:block"></div>
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border bg-background hover:bg-muted text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            ADMIN LOGIN
          </Link>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-[1400px] mx-auto w-full">
        {lastNotification && (
          <div className="mb-6 bg-primary/10 border border-primary/30 p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              <div>
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                  Presensi {lastNotification.mode} Berhasil
                </p>
                <h3 className="text-base font-semibold text-foreground">
                  ID: <span className="text-primary">{lastNotification.name}</span>
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-mono font-medium border px-2 py-1 ${getStatusClass(lastNotification.status)}`}>
                {lastNotification.status}
              </span>
              <span className="text-xs font-mono text-muted-foreground">{lastNotification.time}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-4">
            <LiveCamera onLog={handleLog} />

            <div className="border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono font-semibold text-foreground uppercase tracking-widest">Petunjuk Penggunaan</span>
              </div>
              <ul className="text-[10px] font-mono text-muted-foreground space-y-1 ml-6 list-disc">
                <li>Pilih mode <strong className="text-foreground">MASUK</strong> atau <strong className="text-foreground">KELUAR</strong>.</li>
                <li>Posisikan wajah Anda tepat di depan kamera dalam bingkai panduan.</li>
                <li>Sistem mencocokkan wajah Anda secara otomatis ke seluruh database.</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <Card className="border border-border bg-card rounded-none shadow-none">
              <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-sm font-semibold text-foreground">
                      Aktivitas Presensi
                    </CardTitle>
                    <p className="text-[10px] font-mono text-muted-foreground">Real-time logs</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 border border-primary/30 bg-primary/10 px-2 py-0.5">
                  <span className="w-1.5 h-1.5 bg-primary" />
                  <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest">Live</span>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {isLoadingLogs ? (
                  <div className="p-8 text-center text-[10px] font-mono text-muted-foreground">
                    Memuat data...
                  </div>
                ) : logs.length === 0 ? (
                  <div className="p-8 text-center text-[10px] font-mono text-muted-foreground">
                    Belum ada aktivitas presensi hari ini.
                  </div>
                ) : (
                  <div className="max-h-[500px] overflow-y-auto">
                    {logs.map((log) => {
                      const scanDate = new Date(log.scan_time);
                      const timeStr = scanDate.toLocaleTimeString("id-ID", {
                        timeZone: "Asia/Jakarta",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <div
                          key={log.id}
                          className="border-b border-border/50 p-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-muted border border-border flex items-center justify-center">
                              <span className="text-[10px] font-mono font-bold text-foreground">
                                {log.user?.nama ? log.user.nama.substring(0, 2).toUpperCase() : "??"}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-foreground">{log.user?.nama || "Unknown"}</p>
                              <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground mt-0.5">
                                <span>{timeStr}</span>
                                <span>|</span>
                                <span className="text-primary">{Math.round((log.confidence_score || 0.8) * 100)}% Match</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <span className={`text-[10px] font-mono font-medium border px-1.5 py-0.5 ${getStatusClass(log.status)}`}>
                              {log.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="border border-border bg-card p-3 flex items-center justify-between text-[10px] font-mono">
              <span className="text-muted-foreground">Terminal 01</span>
              <span className="text-muted-foreground">Threshold: <span className="text-foreground">0.45</span></span>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-card px-6 py-3 text-center text-[10px] font-mono text-muted-foreground mt-auto">
        &copy; {new Date().getFullYear()} Jetson_Attend // AI Biometric Terminal
      </footer>
    </div>
  );
}
