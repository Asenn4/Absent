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
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck,
  ChevronRight,
  UserCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

  // Audio Beep generator menggunakan Web Audio API (tidak butuh file mp3 eksternal)
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

  // Ambil Riwayat Presensi Hari Ini
  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/logs");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setLogs(data.data.slice(0, 8)); // Ambil 8 log paling anyar
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
    const pollInterval = setInterval(fetchLogs, 10000); // Polling setiap 10 detik
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
        return <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono text-[10px]">HADIR</Badge>;
      case "terlambat":
        return <Badge className="bg-amber-100 text-amber-800 border border-amber-300 font-mono text-[10px]">TERLAMBAT</Badge>;
      case "pulang":
        return <Badge className="bg-blue-100 text-blue-800 border border-blue-300 font-mono text-[10px]">PULANG</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800 font-mono text-[10px]">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Background Glow Cyber */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Header Bar */}
      <header className="relative z-10 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Judul */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <ScanFace className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold tracking-tight text-white text-lg">AI FACE ATTENDANCE</h1>
                <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold">
                  KIOSK v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Terminal Presensi Cerdas Berbasis Deep Learning</p>
            </div>
          </div>

          {/* Jam & Tanggal Digital */}
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-200">{currentDate || "Memuat tanggal..."}</div>
              <div className="text-xl font-mono font-bold text-cyan-400 tracking-wider">
                {currentTime || "--:--:-- WIB"}
              </div>
            </div>

            {/* Tombol Menuju Portal Login */}
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 shadow-sm transition-all duration-200 group"
            >
              <LogIn className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              <span>Portal Admin / Mahasiswa</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-6 flex flex-col justify-center">
        {/* Notifikasi Popup Kehadiran Terakhir */}
        {lastNotification && (
          <div className="mb-6 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-blue-500/20 border border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300 shadow-lg shadow-emerald-500/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  Presensi {lastNotification.mode} Sukses
                </p>
                <h3 className="text-base font-bold text-white">
                  Selamat Datang, <span className="text-cyan-300">{lastNotification.name}</span>!
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500 text-slate-900 font-bold font-mono px-3 py-1">
                {lastNotification.status.toUpperCase()}
              </Badge>
              <span className="text-xs font-mono text-slate-400">{lastNotification.time} WIB</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Kolom Kiri: Kamera Scan AI (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <LiveCamera onLog={handleLog} />

            {/* Petunjuk Penggunaan Cepat */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2 text-cyan-400 text-xs font-bold font-mono tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>PANDUAN PRESENSI KIOSK</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>Pilih mode terlebih dahulu: <strong className="text-emerald-400">MODE: MASUK</strong> atau <strong className="text-orange-400">MODE: KELUAR</strong>.</li>
                <li>Posisikan wajah Anda tepat di depan kamera hingga kotak deteksi terkunci.</li>
                <li>Sistem otomatis mencocokkan wajah ke seluruh database (1:N) dan mencatat kehadiran tanpa perlu login.</li>
              </ul>
            </div>
          </div>

          {/* Kolom Kanan: Live Feed Presensi Hari Ini (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <Card className="bg-slate-800/60 border border-slate-700 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-700/80 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-white tracking-wide">
                      Aktivitas Presensi
                    </CardTitle>
                    <p className="text-[11px] text-slate-400">Pembaruan real-time dari seluruh pengguna</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-300 font-bold uppercase tracking-wider">Live</span>
                </div>
              </CardHeader>

              <CardContent className="p-4">
                {isLoadingLogs ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-mono">Memuat log kehadiran...</span>
                  </div>
                ) : logs.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center gap-2 text-slate-400">
                    <Users className="w-8 h-8 opacity-40 text-slate-500" />
                    <p className="text-xs">Belum ada aktivitas presensi hari ini.</p>
                    <span className="text-[10px] text-slate-500">Berdirilah di depan kamera untuk memulai absensi.</span>
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
                          className="bg-slate-900/60 hover:bg-slate-900/90 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between transition-all duration-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center font-bold text-xs text-white uppercase shadow">
                              {log.user?.nama ? log.user.nama.substring(0, 2) : "US"}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-100">{log.user?.nama || "Pengguna Terdaftar"}</p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <span>{timeStr} WIB</span>
                                <span>•</span>
                                <span className="font-mono text-cyan-400">{Math.round((log.confidence_score || 0.8) * 100)}% Cocok</span>
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

            {/* Info Card Engine */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>AI Face Engine: InsightFace (Buffalo_l)</span>
              </div>
              <span className="text-cyan-400">Threshold: 0.50</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 bg-slate-900/80 backdrop-blur-xl px-6 py-3 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} AI Face Recognition Attendance System • Proyek Pembelajaran Kampus</p>
      </footer>
    </div>
  );
}
