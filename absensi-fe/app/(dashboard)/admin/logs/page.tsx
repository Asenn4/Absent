"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Filter, Eye, Activity } from "lucide-react";
import { AttendanceEvidenceModal } from "@/components/attendance-evidence-modal";
import { ManualIzinModal } from "@/components/manual-izin-modal";

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/logs");
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Terlambat": return "text-amber-500 border-amber-500/30";
      case "Alpa": return "text-destructive border-destructive/30";
      case "Sakit": return "text-pink-400 border-pink-400/30";
      case "Izin": return "text-blue-400 border-blue-400/30";
      default: return "text-primary border-primary/30";
    }
  };

  const filteredLogs = logs.filter(log => 
    log.user?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Log Presensi</h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">seluruh catatan aktivitas biometrik</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsManualModalOpen(true)}
            className="text-xs font-mono h-8 border-border"
          >
            Input Manual
          </Button>
          <Button 
            variant="outline" 
            className="gap-1.5 text-xs font-mono h-8 border-border"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="border border-border bg-card">
        <div className="border-b border-border p-3 flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Cari nama atau status..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-xs font-mono bg-background border-border"
            />
          </div>
          <div className="flex items-center gap-2 border border-border px-2 py-1 bg-muted/20">
             <Activity className="w-3.5 h-3.5 text-muted-foreground" />
             <span className="text-[10px] font-mono text-muted-foreground">{filteredLogs.length} Records</span>
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Waktu Scan</TableHead>
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Pengguna</TableHead>
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Role</TableHead>
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Status</TableHead>
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest text-center">Score (AI)</TableHead>
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs font-mono text-muted-foreground">Memuat data log...</TableCell>
              </TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs font-mono text-muted-foreground">Tidak ada log presensi.</TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => {
                const date = new Date(log.scan_time);
                const isManual = log.confidence_score === 1 && log.device_loc === 'Manual/Admin';
                
                return (
                  <TableRow key={log.id} className="border-border hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="text-xs font-medium text-foreground">{date.toLocaleDateString("id-ID")}</div>
                      <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{date.toLocaleTimeString("id-ID")}</div>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-foreground">{log.user?.nama}</TableCell>
                    <TableCell>
                      <span className={`text-[10px] font-mono uppercase tracking-widest ${log.user?.role === 'admin' ? 'text-amber-500' : 'text-muted-foreground'}`}>
                        {log.user?.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-[10px] font-mono font-medium border px-1.5 py-0.5 ${getStatusClass(log.status)}`}>
                        {log.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                       {isManual ? (
                          <span className="text-[10px] font-mono text-muted-foreground">MANUAL</span>
                       ) : (
                          <span className="text-[10px] font-mono font-bold text-primary">
                            {Math.round(log.confidence_score * 100)}%
                          </span>
                       )}
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-[10px] font-mono text-primary hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5 inline mr-1" />bukti
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AttendanceEvidenceModal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        log={selectedLog}
      />
      
      <ManualIzinModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSuccess={fetchLogs}
      />
    </div>
  );
}
