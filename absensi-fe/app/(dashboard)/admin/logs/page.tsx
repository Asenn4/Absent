"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { AttendanceEvidenceModal } from "@/components/attendance-evidence-modal";
import { ManualIzinModal } from "@/components/manual-izin-modal";
import { Eye, Plus } from "lucide-react";

export default function AttendanceLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [logsData, setLogsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isIzinModalOpen, setIsIzinModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetch("/api/logs")
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          const formatted = res.data.map((log: any) => {
            const time = new Date(log.scan_time).toLocaleTimeString('id-ID');
            const isCheckOut = log.status === "Pulang";
            
            return {
              id: log.id,
              name: log.user.nama,
              date: new Date(log.scan_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
              checkIn: isCheckOut ? "-" : time,
              checkOut: isCheckOut ? time : "-",
              status: log.status,
              confidence: (log.confidence_score * 100).toFixed(1),
              device: log.device_loc,
              photoUrl: log.photo_url
            };
          });
          setLogsData(formatted);
        }
      })
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Terlambat": return "text-amber-500 border-amber-500/30";
      case "Izin": return "text-blue-400 border-blue-400/30";
      case "Sakit": return "text-pink-400 border-pink-400/30";
      default: return "text-primary border-primary/30";
    }
  };

  const filtered = logsData.filter((log) => log.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Log Absensi</h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">riwayat pemindaian & catatan kehadiran</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-1.5 text-xs font-mono h-8">
            <Download className="w-3.5 h-3.5" /> Ekspor
          </Button>
          <Button onClick={() => setIsIzinModalOpen(true)} variant="outline" className="gap-1.5 text-xs font-mono h-8">
            <Plus className="w-3.5 h-3.5" /> Input Izin
          </Button>
        </div>
      </div>

      <div className="border border-border bg-card">
        <div className="border-b border-border p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 bg-background border-border text-xs font-mono h-7"
            />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            {filtered.length}/{logsData.length} entri
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Nama</TableHead>
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Tanggal</TableHead>
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Masuk</TableHead>
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Keluar</TableHead>
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Status</TableHead>
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest text-right">AI %</TableHead>
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest text-right">Bukti</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((log) => (
              <TableRow key={log.id} className="border-border hover:bg-muted/30 transition-colors">
                <TableCell className="text-xs font-medium text-foreground">{log.name}</TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">{log.date}</TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">{log.checkIn}</TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">{log.checkOut}</TableCell>
                <TableCell>
                  <span className={	ext-[10px] font-mono font-medium border px-1.5 py-0.5 }>
                    {log.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-[10px] font-mono text-muted-foreground">{log.confidence}%</span>
                </TableCell>
                <TableCell className="text-right">
                  <button
                    onClick={() => setSelectedLog(log)}
                    className="text-[10px] font-mono text-primary hover:underline"
                  >
                    <Eye className="w-3.5 h-3.5 inline mr-1" />lihat
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AttendanceEvidenceModal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        log={selectedLog}
      />

      <ManualIzinModal
        isOpen={isIzinModalOpen}
        onClose={() => setIsIzinModalOpen(false)}
        onSuccess={() => setRefreshTrigger(prev => prev + 1)}
      />
    </div>
  );
}
