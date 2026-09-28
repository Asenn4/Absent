"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LiveCamera } from "./live-camera";
import { ScanFace } from "lucide-react";

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLog: (mode: "checkIn" | "checkOut", name: string, status?: string) => void;
}

export function CheckInModal({ isOpen, onClose, onLog }: CheckInModalProps) {
  const handleLog = (mode: "checkIn" | "checkOut", name: string, status?: string) => {
    onLog(mode, name, status);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-card border border-border">
        <DialogHeader className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ScanFace className="w-4 h-4 text-muted-foreground" />
            <DialogTitle className="text-sm font-semibold text-foreground">Pemindai Wajah</DialogTitle>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground mt-0.5">Arahkan wajah ke kamera untuk absensi otomatis</p>
        </DialogHeader>

        <div className="p-4">
          <LiveCamera onLog={handleLog} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
