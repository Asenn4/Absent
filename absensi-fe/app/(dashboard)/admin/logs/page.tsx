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
import { Card, CardHeader } from "@/components/ui/card";
import { Search, Filter, Download } from "lucide-react";
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
          // Format data
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900">Log Absensi</h1>
          <p className="text-blue-600/80 mt-1 font-medium">Riwayat detail semua pemindaian dan catatan kehadiran.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 font-bold rounded-xl shadow-sm">
            <Download className="w-4 h-4" /> Ekspor CSV
          </Button>
          <Button onClick={() => setIsIzinModalOpen(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md">
            <Plus className="w-4 h-4" /> Input Manual / Izin
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md">
            <Filter className="w-4 h-4" /> Filter
          </Button>
        </div>
      </div>

      <Card className="bg-white border border-blue-100 shadow-md overflow-hidden rounded-2xl">
        <CardHeader className="border-b border-blue-100/50 pb-4 bg-blue-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
            <Input
              type="search"
              placeholder="Cari riwayat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white border-blue-200 focus-visible:ring-blue-500 rounded-xl"
            />
          </div>
          <div className="text-sm font-semibold text-blue-900">
            Menampilkan {logsData.filter(log => log.name.toLowerCase().includes(searchTerm.toLowerCase())).length} dari {logsData.length} entri
          </div>
        </CardHeader>
        <Table>
          <TableHeader className="bg-blue-50/50">
            <TableRow>
              <TableHead className="font-bold text-blue-900">Nama Pengguna</TableHead>
              <TableHead className="font-bold text-blue-900">Tanggal</TableHead>
              <TableHead className="font-bold text-blue-900">Masuk</TableHead>
              <TableHead className="font-bold text-blue-900">Keluar</TableHead>
              <TableHead className="font-bold text-blue-900">Status</TableHead>
              <TableHead className="font-bold text-blue-900 text-right">Akurasi AI</TableHead>
              <TableHead className="font-bold text-blue-900 text-right">Bukti</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logsData
              .filter((log) => log.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((log) => (
              <TableRow key={log.id} className="hover:bg-blue-50/20 transition-colors border-b border-blue-50">
                <TableCell className="font-bold text-blue-950">{log.name}</TableCell>
                <TableCell className="text-slate-600 font-medium">{log.date}</TableCell>
                <TableCell className="text-slate-600 font-mono text-xs font-semibold">{log.checkIn}</TableCell>
                <TableCell className="text-slate-600 font-mono text-xs font-semibold">{log.checkOut}</TableCell>
                <TableCell>
                  {log.status === "Terlambat" ? (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 font-bold border border-yellow-200">
                      {log.status}
                    </Badge>
                  ) : log.status === "Izin" ? (
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 font-bold border border-indigo-200">
                      {log.status}
                    </Badge>
                  ) : log.status === "Sakit" ? (
                    <Badge variant="secondary" className="bg-pink-100 text-pink-800 hover:bg-pink-200 font-bold border border-pink-200">
                      {log.status}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 font-bold border border-green-200">
                      {log.status}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200 font-bold shadow-xs">
                    {log.confidence}%
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedLog(log)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 inline-flex"
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

      <ManualIzinModal
        isOpen={isIzinModalOpen}
        onClose={() => setIsIzinModalOpen(false)}
        onSuccess={() => setRefreshTrigger(prev => prev + 1)}
      />
    </div>
  );
}
