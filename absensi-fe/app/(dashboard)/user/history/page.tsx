"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { AttendanceEvidenceModal } from "@/components/attendance-evidence-modal";
import { Eye } from "lucide-react";

export default function MyHistoryPage() {
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/logs/user")
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          const groupedByDate: Record<string, any> = {};

          res.data.forEach((log: any) => {
            const dateStr = new Date(log.scan_time).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' });
            const time = new Date(log.scan_time).toLocaleTimeString('id-ID', { hour12: false });
            const isCheckOut = log.status === "Pulang";
            
            if (!groupedByDate[dateStr]) {
              groupedByDate[dateStr] = {
                id: log.id,
                date: dateStr,
                checkIn: "-",
                checkOut: "-",
                status: log.status,
                device: log.device_loc,
                photoUrl: log.photo_url
              };
            }

            if (isCheckOut) {
              if (groupedByDate[dateStr].checkOut === "-") {
                groupedByDate[dateStr].checkOut = time;
              }
            } else {
              groupedByDate[dateStr].checkIn = time;
              groupedByDate[dateStr].status = log.status;
              groupedByDate[dateStr].device = log.device_loc;
              groupedByDate[dateStr].photoUrl = log.photo_url;
              groupedByDate[dateStr].id = log.id;
            }
          });
          
          setLogs(Object.values(groupedByDate));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Terlambat": return "text-amber-500 border-amber-500/30";
      case "Alpa": return "text-destructive border-destructive/30";
      default: return "text-primary border-primary/30";
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Riwayat Saya</h1>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">log catatan kehadiran</p>
      </div>

      <div className="border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Tanggal</TableHead>
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Masuk</TableHead>
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Keluar</TableHead>
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Perangkat</TableHead>
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Status</TableHead>
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest text-right">Bukti</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} className="border-border hover:bg-muted/30 transition-colors">
                <TableCell className="text-xs font-medium text-foreground">{log.date}</TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">{log.checkIn}</TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">{log.checkOut}</TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">{log.device}</TableCell>
                <TableCell>
                  <span className={`text-[10px] font-mono font-medium border px-1.5 py-0.5 ${getStatusClass(log.status)}`}>
                    {log.status}
                  </span>
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
    </div>
  );
}
