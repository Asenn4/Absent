"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { LiveCamera } from "@/components/live-camera";
import { 
  ScanFace, 
  LogIn, 
  Clock, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck,
  Activity,
  ArrowRight,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

  // Audio Beep generator menggunakan Web Audio API
  const playBeep = useCallback((isSuccess = true) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (isSuccess) {
        osc.type = "sine";
        osc.frequency.setValueAtTime(784, ctx.currentTime); // G5
        osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.15); // C6
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {
      // Audio context might be restricted before interaction
    }
  }, []);

  // Update Jam & Tanggal Digital Real-Time
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
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Ambil Riwayat Presensi
  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/logs");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setLogs(data.data.slice(0, 10)); // Ambil 10 log paling anyar
        }
      }
    } catch (e) {
      console.error("Gagal mengambil log presensi:", e);
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    const pollInterval = setInterval(fetchLogs, 8000); // Polling setiap 8 detik
    return () => clearInterval(pollInterval);
  }, [fetchLogs]);

  // Handler saat scan berhasil
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

    // Refresh daftar log secara langsung
    fetchLogs();

    // Sembunyikan notifikasi setelah 5 detik
    setTimeout(() => {
      setLastNotification(null);
    }, 5000);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "hadir":
        return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs px-2.5 py-0.5">HADIR</Badge>;
      case "terlambat":
        return <Badge className="bg-amber-50 text-amber-700 border border-amber-200 font-bold text-xs px-2.5 py-0.5">TERLAMBAT</Badge>;
      case "pulang":
        return <Badge className="bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs px-2.5 py-0.5">PULANG</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700 font-bold text-xs px-2.5 py-0.5">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
      {/* Top Header Bar (Matching Dashboard Shell & TopHeader) */}
      <header className="h-20 mx-4 md:mx-8 mt-4 mb-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-blue-100 shadow-[0_4px_24px_-8px_rgba(37,99,235,0.12)] flex items-center justify-between px-6 sticky top-4 z-50 transition-all duration-300">
        {/* Logo & Judul Sistem */}
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-yellow-400 rounded-xl shadow-[0_0_15px_rgba(250,204,21,0.5)]">
            <ShieldCheck className="w-6 h-6 text-blue-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-blue-950">
                Jetson <span className="text-yellow-500">Attend</span>
              </h1>
              <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                TERMINAL KIOSK
              </span>
            </div>
            <p className="text-xs text-blue-600/70 font-medium">Terminal Presensi Wajah AI</p>
          </div>
        </div>

        {/* Jam Digital Realtime & Tombol Portal Login */}
        <div className="flex items-center gap-4 md:gap-8">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-500">{currentDate || "Memuat tanggal..."}</p>
            <p className="text-xl font-mono font-extrabold text-blue-900 tracking-wider">
              {currentTime || "--:--:-- WIB"}
            </p>
          </div>

          <Link
            href="/login"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all duration-200 group active:scale-95"
          >
            <LogIn className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            <span>Login Admin</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-4 space-y-6">
        {/* 3 Quick Cards (Sama seperti gaya User Dashboard) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <Card className="bg-white border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-3 -mr-3 w-20 h-20 bg-yellow-400/10 rounded-full blur-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-blue-800">Status Engine AI</CardTitle>
              <div className="p-2 bg-blue-50 rounded-xl border border-blue-100 text-blue-600">
                <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-extrabold text-blue-950">ONLINE & AKTIF</div>
              <p className="text-xs font-medium text-emerald-600 mt-1">Buffalo_L InsightFace Siap</p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-3 -mr-3 w-20 h-20 bg-blue-400/10 rounded-full blur-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-blue-800">Aturan Jam Masuk</CardTitle>
              <div className="p-2 bg-blue-50 rounded-xl border border-blue-100 text-blue-600">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-extrabold text-blue-950">09:00 WIB</div>
              <p className="text-xs font-medium text-slate-500 mt-1">Lewat dari jam ini = Terlambat</p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-3 -mr-3 w-20 h-20 bg-emerald-400/10 rounded-full blur-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-blue-800">Presensi Tercatat</CardTitle>
              <div className="p-2 bg-blue-50 rounded-xl border border-blue-100 text-blue-600">
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-extrabold text-blue-950">{logs.length} Log</div>
              <p className="text-xs font-medium text-blue-500 mt-1">Aktivitas presensi terbaru</p>
            </CardContent>
          </Card>
        </div>

        {/* Notifikasi Popup Kehadiran Terakhir */}
        {lastNotification && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-emerald-500/10 animate-in fade-in slide-in-from-top-3 duration-300">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">
                  Presensi {lastNotification.mode} Berhasil
                </p>
                <h3 className="text-base font-bold text-slate-900">
                  Selamat Datang, <span className="text-blue-700">{lastNotification.name}</span>!
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(lastNotification.status)}
              <span className="text-xs font-mono font-bold text-slate-500">{lastNotification.time} WIB</span>
            </div>
          </div>
        )}

        {/* Main Grid: Kamera di Kiri, Live Logs di Kanan */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Kamera Live (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <LiveCamera onLog={handleLog} />

            {/* Panduan Singkat */}
            <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-blue-900 text-xs font-extrabold uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span>Petunjuk Penggunaan Terminal Absensi</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li>Pilih mode yang diinginkan: <strong className="text-emerald-600 font-bold">MODE: MASUK</strong> atau <strong className="text-amber-600 font-bold">MODE: KELUAR</strong>.</li>
                <li>Posisikan wajah Anda tepat di depan kamera dalam bingkai panduan.</li>
                <li>Klik tombol <strong className="text-blue-600 font-bold">"Scan Wajah Sekarang"</strong> atau biarkan kamera memindai secara otomatis.</li>
                <li>Sistem mencocokkan wajah Anda secara otomatis ke seluruh database tanpa perlu login.</li>
              </ul>
            </div>
          </div>

          {/* Kolom Kanan: Live Logs Aktivitas Hari Ini (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="bg-white border border-blue-100 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-blue-50 bg-slate-50/50 flex flex-row items-center justify-between px-5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-extrabold text-blue-950">
                      Aktivitas Presensi
                    </CardTitle>
                    <p className="text-[11px] text-slate-500">Pembaruan kehadiran real-time</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider">Live</span>
                </div>
              </CardHeader>

              <CardContent className="p-4">
                {isLoadingLogs ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-medium">Memuat log kehadiran...</span>
                  </div>
                ) : logs.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center gap-2 text-slate-400">
                    <Users className="w-8 h-8 opacity-40 text-slate-400" />
                    <p className="text-xs font-medium text-slate-600">Belum ada aktivitas presensi hari ini.</p>
                    <span className="text-[11px] text-slate-400">Silakan scan wajah pada kamera untuk mulai presensi.</span>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
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
                          className="bg-slate-50/70 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200 rounded-xl p-3 flex items-center justify-between transition-all duration-200"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-blue-100 shadow-sm">
                              <AvatarFallback className="bg-gradient-to-br from-blue-700 to-blue-900 text-white font-bold text-xs">
                                {log.user?.nama ? log.user.nama.substring(0, 2).toUpperCase() : "US"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{log.user?.nama || "Pengguna Terdaftar"}</p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <span className="font-medium">{timeStr} WIB</span>
                                <span>•</span>
                                <span className="font-mono text-blue-600 font-bold">
                                  {Math.round((log.confidence_score || 0.8) * 100)}% Cocok
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            {getStatusBadge(log.status)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Box */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-3.5 flex items-center justify-between text-xs text-blue-900 font-medium">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Threshold Kemiripan: <strong className="font-mono">0.45</strong></span>
              </div>
              <span className="text-slate-500 text-[11px]">Kiosk Terminal 01</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer (Matching App Design) */}
      <footer className="mt-8 border-t border-slate-200/80 bg-white/80 backdrop-blur-md px-6 py-4 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Jetson Attend • Sistem Presensi Wajah Berbasis Deep Learning</p>
      </footer>
    </div>
  );
}
