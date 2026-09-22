"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, MapPin, ScanFace, Activity, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AttendanceLog {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
  device: string;
  name?: string;
  photoUrl?: string;
}

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: AttendanceLog | null;
}

function MockScreenshot({ time, type, device, photoUrl }: { time: string; type: string; device: string, photoUrl?: string }) {
  if (time === "-" || !time) {
    return (
      <div className="w-full aspect-video bg-slate-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 text-slate-400">
        <Camera className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm font-medium">Tidak ada data foto</p>
      </div>
    );
  }

  // A visually pleasing mock of an AI camera frame
  return (
    <div className="w-full aspect-video bg-slate-900 rounded-xl overflow-hidden relative group border border-slate-800 shadow-inner">
      {/* Background Image - ACTUAL PHOTO */}
      {photoUrl ? (
        <img src={photoUrl} alt="Bukti Absen" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 text-slate-500">
           <Camera className="w-8 h-8 mb-2 opacity-30" />
           <span className="text-sm font-medium opacity-50">Input Manual</span>
        </div>
      )}
    </div>
  );
}

export function AttendanceEvidenceModal({ isOpen, onClose, log }: EvidenceModalProps) {
  if (!log) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-[95vw] md:max-w-5xl lg:max-w-6xl w-full rounded-2xl p-0 overflow-hidden bg-white border-blue-100">
        <DialogHeader className="p-6 pb-4 bg-blue-50/50 border-b border-blue-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <ScanFace className="w-6 h-6 text-blue-700" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-xl font-bold text-blue-900">Bukti Kehadiran</DialogTitle>
              <p className="text-sm font-medium text-blue-600/80 mt-1 flex items-center gap-2">
                <Clock className="w-4 h-4" /> {log.date}
                {log.name && <span className="ml-2 text-slate-500 border-l border-slate-300 pl-2">{log.name}</span>}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-700 text-sm">Tangkapan Masuk (Check In)</h3>
              <Badge variant="outline" className={log.checkIn !== "-" && log.checkIn ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-100 text-slate-500"}>
                {log.checkIn || "-"}
              </Badge>
            </div>
            <MockScreenshot time={log.checkIn} type="CHECK_IN" device={log.device} photoUrl={log.checkIn !== "-" ? log.photoUrl : undefined} />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-700 text-sm">Tangkapan Keluar (Check Out)</h3>
              <Badge variant="outline" className={log.checkOut !== "-" && log.checkOut ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-slate-100 text-slate-500"}>
                {log.checkOut || "-"}
              </Badge>
            </div>
            <MockScreenshot time={log.checkOut} type="CHECK_OUT" device={log.device} photoUrl={log.checkOut !== "-" ? log.photoUrl : undefined} />
          </div>
        </div>
        
        <div className="p-4 bg-white border-t border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs font-medium text-slate-500">
          <p className="truncate w-full sm:w-auto mr-4">ID Log: <span className="font-mono text-slate-700">{log.id}</span></p>
          <p className="flex items-center gap-1.5 shrink-0"><Activity className="w-4 h-4 text-green-500" /> Divalidasi oleh Jetson AI</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
