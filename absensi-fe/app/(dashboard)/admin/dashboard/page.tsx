"use client";

import { useEffect, useState } from "react";
import { Users, UserCheck, UserX, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSiswa: 0,
    hadir: 0,
    terlambat: 0,
    alpa: 0,
  });

  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, logsRes] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/logs?limit=5")
        ]);
        
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success) setStats(statsData.data);
        }

        if (logsRes.ok) {
          const logsData = await logsRes.json();
          if (logsData.success) setRecentLogs(logsData.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 10000); // Polling 10 detik
    return () => clearInterval(interval);
  }, []);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Terlambat": return "text-amber-500 border-amber-500/30";
      case "Alpa": return "text-destructive border-destructive/30";
      default: return "text-primary border-primary/30";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Overview</h1>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">statistik kehadiran hari ini</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Siswa */}
        <div className="border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-widest">Total Siswa</span>
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <div className="text-2xl font-mono font-bold text-foreground">{stats.totalSiswa}</div>
        </div>

        {/* Hadir */}
        <div className="border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-widest">Hadir</span>
            <UserCheck className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="text-2xl font-mono font-bold text-foreground">{stats.hadir}</div>
        </div>

        {/* Terlambat */}
        <div className="border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-widest">Terlambat</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-mono font-bold text-foreground">{stats.terlambat}</div>
        </div>

        {/* Alpa */}
        <div className="border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-widest">Alpa</span>
            <UserX className="w-3.5 h-3.5 text-destructive" />
          </div>
          <div className="text-2xl font-mono font-bold text-foreground">{stats.alpa}</div>
        </div>
      </div>

      <div className="border border-border bg-card">
        <div className="border-b border-border p-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-foreground">Log Presensi Terbaru</h2>
          <span className="text-[10px] font-mono text-muted-foreground">Live Update</span>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Waktu</TableHead>
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Nama</TableHead>
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Status</TableHead>
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest text-right">Lokasi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-xs font-mono text-muted-foreground">Memuat data...</TableCell>
              </TableRow>
            ) : recentLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-xs font-mono text-muted-foreground">Belum ada aktivitas hari ini.</TableCell>
              </TableRow>
            ) : (
              recentLogs.map((log) => (
                <TableRow key={log.id} className="border-border hover:bg-muted/30 transition-colors">
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {format(new Date(log.scan_time), 'HH:mm', { locale: id })}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-foreground">{log.user.nama}</TableCell>
                  <TableCell>
                    <span className={`text-[10px] font-mono font-medium border px-1.5 py-0.5 ${getStatusClass(log.status)}`}>
                      {log.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-[10px] font-mono text-muted-foreground text-right">{log.device_loc}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
