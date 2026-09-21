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
import { Card } from "@/components/ui/card";
import { Calendar as CalendarIcon, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
          // Format data
          const formatted = res.data.map((log: any) => ({
            id: log.id,
            date: new Date(log.scan_time).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' }),
            checkIn: new Date(log.scan_time).toLocaleTimeString('id-ID', { hour12: false }),
            checkOut: "-", // Simplified since we only record 1 scan for now
            status: log.status,
            device: log.device_loc
          }));
          setLogs(formatted);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900">Riwayat Saya</h1>
          <p className="text-blue-600/80 mt-1 font-medium">Log detail catatan kehadiran Anda.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
            <Input
              type="text"
              placeholder="Cari berdasarkan tanggal..."
              className="pl-10 bg-white border-blue-200 focus-visible:ring-blue-500 rounded-xl"
            />
          </div>
          <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-white shadow-sm font-bold rounded-xl gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
      </div>

      <Card className="bg-white border border-blue-100 shadow-md overflow-hidden rounded-2xl">
        <Table>
          <TableHeader className="bg-blue-50/50">
            <TableRow className="border-blue-100">
              <TableHead className="font-bold text-blue-900">Tanggal</TableHead>
              <TableHead className="font-bold text-blue-900">Masuk</TableHead>
              <TableHead className="font-bold text-blue-900">Keluar</TableHead>
              <TableHead className="font-bold text-blue-900">Lokasi Perangkat</TableHead>
              <TableHead className="font-bold text-blue-900">Status</TableHead>
              <TableHead className="font-bold text-blue-900 text-right">Bukti</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} className="hover:bg-blue-50/50 border-blue-100 transition-colors">
                <TableCell className="font-bold text-slate-700">{log.date}</TableCell>
                <TableCell className="text-blue-700 font-mono text-xs font-bold">{log.checkIn}</TableCell>
                <TableCell className="text-blue-700 font-mono text-xs font-bold">{log.checkOut}</TableCell>
                <TableCell className="text-slate-500 font-medium">{log.device}</TableCell>
                <TableCell>
                  {log.status === "Terlambat" ? (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 font-bold border border-yellow-200">
                      {log.status}
                    </Badge>
                  ) : log.status === "Alpa" ? (
                    <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200 font-bold border border-red-200">
                      {log.status}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 font-bold border border-green-200">
                      {log.status}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedLog(log)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  >
                    <Eye className="w-4 h-4 mr-2" /> Lihat
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <AttendanceEvidenceModal 
        isOpen={!!selectedLog} 
        onClose={() => setSelectedLog(null)} 
        log={selectedLog} 
      />
    </div>
  );
}
