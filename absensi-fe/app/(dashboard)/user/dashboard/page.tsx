"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, Calendar, Clock, Camera } from "lucide-react";
import { CheckInModal } from "@/components/check-in-modal";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function UserDashboard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [notification, setNotification] = useState<{show: boolean, message: string, type: 'success' | 'info'}>({ show: false, message: '', type: 'success' });
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/user")
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setAttendanceRate(res.data.attendanceRate);
          setIsVerified(res.data.isVerified);
          const formattedLogs = res.data.history.map((log: any) => ({
            id: log.id,
            date: log.date,
            checkIn: log.checkIn,
            checkOut: log.checkOut,
            status: log.status
          }));
          setLogs(formattedLogs);
        }
      })
      .catch(console.error);
  }, []);

  const handleScan = (mode: "checkIn" | "checkOut", name: string, computedStatus?: string) => {
    const today = new Date().toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' });
    const now = new Date().toLocaleTimeString('id-ID', { hour12: false });

    setLogs(prev => {
      const todayLogIndex = prev.findIndex(log => log.date === today);
      
      if (todayLogIndex >= 0) {
        const newLogs = [...prev];
        const log = { ...newLogs[todayLogIndex] };
        
        if (mode === "checkIn" && (!log.checkIn || log.checkIn === "-")) {
          log.checkIn = now;
          if (computedStatus) log.status = computedStatus;
        } else if (mode === "checkOut") {
          log.checkOut = now;
        }
        
        newLogs[todayLogIndex] = log;
        return newLogs;
      } else {
        const newLog = {
          id: Date.now().toString(),
          date: today,
          checkIn: mode === "checkIn" ? now : "-",
          checkOut: mode === "checkOut" ? now : "-",
          status: computedStatus || "Hadir"
        };
        return [newLog, ...prev];
      }
    });

    setNotification({
      show: true,
      message: Wajah terverifikasi! Absen {mode === 'checkIn' ? 'masuk' : 'keluar'} pada {now}.,
      type: 'success'
    });

    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Terlambat": return "text-amber-500 border-amber-500/30";
      case "Izin": return "text-blue-400 border-blue-400/30";
      case "Sakit": return "text-pink-400 border-pink-400/30";
      default: return "text-primary border-primary/30";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Dashboard Saya</h1>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">ringkasan kehadiran</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-widest">KEHADIRAN</span>
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <div className="text-2xl font-mono font-bold text-foreground tracking-tight">{attendanceRate}%</div>
          <p className="text-[10px] font-mono text-muted-foreground mt-1">Bulan ini</p>
        </div>

        <div className="border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-widest">JADWAL</span>
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <div className="text-sm font-mono font-bold text-foreground">
            {new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[10px] font-mono text-muted-foreground">IN <span className="text-foreground font-bold">09:00</span></span>
            <span className="text-[10px] font-mono text-muted-foreground">OUT <span className="text-foreground font-bold">16:00</span></span>
          </div>
        </div>

        <div className="border border-border bg-card p-4 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-widest">ABSENSI</span>
            <Camera className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 mb-3">
            {isVerified ? (
              <span className="text-[10px] font-mono text-primary border border-primary/30 px-1.5 py-0.5 inline-flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> Wajah OK
              </span>
            ) : (
              <span className="text-[10px] font-mono text-amber-500 border border-amber-500/30 px-1.5 py-0.5">Pending</span>
            )}
          </div>
          <button
            onClick={() => setIsCheckInModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground font-mono text-xs hover:bg-primary/90 transition-colors"
          >
            <Camera className="w-3.5 h-3.5" /> Absen Sekarang
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="border border-border bg-card">
        <div className="border-b border-border p-3 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground">Riwayat Kehadiran</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Tanggal</TableHead>
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Masuk</TableHead>
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Keluar</TableHead>
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} className="border-border hover:bg-muted/30 transition-colors">
                <TableCell className="text-xs font-medium text-foreground">{log.date}</TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">{log.checkIn}</TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">{log.checkOut || "-"}</TableCell>
                <TableCell className="text-right">
                  <span className={	ext-[10px] font-mono font-medium border px-1.5 py-0.5 {getStatusClass(log.status)}}>
                    {log.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        onLog={handleScan}
      />

      {/* Toast Notification */}
      <div
        className={ixed bottom-4 right-4 z-50 transition-all duration-300 transform {notification.show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}}
      >
        <div className="bg-card border border-primary/30 p-3 flex items-start gap-3 max-w-sm">
          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-mono font-bold text-foreground">Berhasil</h4>
            <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{notification.message}</p>
          </div>
          <button
            onClick={() => setNotification(prev => ({ ...prev, show: false }))}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
