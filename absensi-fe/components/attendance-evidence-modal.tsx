"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, Activity, Clock } from "lucide-react";

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

function Screenshot({ time, photoUrl }: { time: string; photoUrl?: string }) {
  if (time === "-" || !time) {
    return (
      <div className="w-full aspect-video bg-muted border border-border flex flex-col items-center justify-center text-muted-foreground">
        <Camera className="w-6 h-6 mb-1 opacity-40" />
        <p className="text-[10px] font-mono">Tidak ada data</p>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video bg-background border border-border overflow-hidden relative">
      {photoUrl ? (
        <img src={photoUrl} alt="Bukti Absen" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
          <Camera className="w-6 h-6 mb-1 opacity-30" />
          <span className="text-[10px] font-mono">Input Manual</span>
        </div>
      )}
    </div>
  );
}

export function AttendanceEvidenceModal({ isOpen, onClose, log }: EvidenceModalProps) {
  if (!log) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] md:max-w-4xl w-full bg-card border border-border p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-sm font-semibold text-foreground">Bukti Kehadiran</DialogTitle>
            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> {log.date}
            </span>
            {log.name && <span className="text-[10px] font-mono text-muted-foreground border-l border-border pl-2">{log.name}</span>}
          </div>
        </DialogHeader>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Check In</span>
              <span className="text-[10px] font-mono text-foreground">{log.checkIn || "-"}</span>
            </div>
            <Screenshot time={log.checkIn} photoUrl={log.checkIn !== "-" ? log.photoUrl : undefined} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Check Out</span>
              <span className="text-[10px] font-mono text-foreground">{log.checkOut || "-"}</span>
            </div>
            <Screenshot time={log.checkOut} photoUrl={log.checkOut !== "-" ? log.photoUrl : undefined} />
          </div>
        </div>

        <div className="px-4 py-3 border-t border-border flex justify-between items-center text-[10px] font-mono text-muted-foreground">
          <span>ID: {log.id}</span>
          <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-primary" /> Jetson AI</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
