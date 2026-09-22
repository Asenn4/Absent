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
    // Optional: Close modal automatically after successful scan
    setTimeout(() => {
      onClose();
    }, 1500); // give it a brief moment to show the success state before closing
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-white border-blue-100 rounded-2xl shadow-xl">
        <DialogHeader className="p-6 pb-4 bg-blue-50/50 border-b border-blue-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl shadow-sm border border-blue-200">
              <ScanFace className="w-6 h-6 text-blue-700" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-xl font-bold text-blue-900">Kamera Pemindai Jetson AI</DialogTitle>
              <p className="text-sm font-medium text-blue-600/80 mt-1">Silakan arahkan wajah Anda ke kamera untuk absensi otomatis.</p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="p-6 bg-slate-50/50">
          <LiveCamera onLog={handleLog} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
