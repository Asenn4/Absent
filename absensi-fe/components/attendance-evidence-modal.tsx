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
}

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: AttendanceLog | null;
}

function MockScreenshot({ time, type, device }: { time: string; type: string; device: string }) {
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
      {/* Background Image Placeholder (Subtle pattern to simulate noise) */}
      <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center mix-blend-luminosity"></div>
      
      {/* Camera Grid & Crosshair */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30 pointer-events-none" />
      
      {/* Detected Face Box (Mock) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-green-500 rounded-sm pointer-events-none">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white -translate-x-[2px] -translate-y-[2px]"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white translate-x-[2px] -translate-y-[2px]"></div>
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white -translate-x-[2px] translate-y-[2px]"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white translate-x-[2px] translate-y-[2px]"></div>
        <div className="absolute -top-6 left-0 bg-green-500 text-white text-[10px] font-bold px-1 py-0.5 rounded-t-sm whitespace-nowrap">
          MATCH (99.8%)
        </div>
      </div>

      {/* Metadata Overlays */}
      <div className="absolute top-3 left-3 flex gap-2 pointer-events-none">
        <Badge variant="outline" className="bg-black/50 text-white border-none text-[10px] backdrop-blur-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse"></div> REC
        </Badge>
        <Badge variant="outline" className="bg-black/50 text-white border-none text-[10px] backdrop-blur-sm font-mono">
          {type}
        </Badge>
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end pointer-events-none">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-blue-400 text-[10px] font-mono bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm w-fit">
            <Activity className="w-3 h-3" /> SYS.AI_ENGINE_V2
          </div>
          <div className="flex items-center gap-1.5 text-white text-[10px] font-mono bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm w-fit truncate max-w-[150px]">
            <MapPin className="w-3 h-3 shrink-0" /> {device || "Kamera Jetson"}
          </div>
        </div>
        <div className="text-yellow-400 text-xs font-mono font-bold bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
          {time}
        </div>
      </div>
    </div>
  );
}

export function AttendanceEvidenceModal({ isOpen, onClose, log }: EvidenceModalProps) {
  if (!log) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl rounded-2xl p-0 overflow-hidden bg-white border-blue-100">
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
            <MockScreenshot time={log.checkIn} type="CHECK_IN" device={log.device} />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-700 text-sm">Tangkapan Keluar (Check Out)</h3>
              <Badge variant="outline" className={log.checkOut !== "-" && log.checkOut ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-slate-100 text-slate-500"}>
                {log.checkOut || "-"}
              </Badge>
            </div>
            <MockScreenshot time={log.checkOut} type="CHECK_OUT" device={log.device} />
          </div>
        </div>
        
        <div className="p-4 bg-white border-t border-blue-100 flex justify-between items-center text-xs font-medium text-slate-500">
          <p>ID Log: <span className="font-mono text-slate-700">{log.id}-{Date.now().toString().slice(-6)}</span></p>
          <p className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-green-500" /> Divalidasi oleh Jetson AI</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
