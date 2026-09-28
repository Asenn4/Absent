"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface ManualIzinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ManualIzinModal({ isOpen, onClose, onSuccess }: ManualIzinModalProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [userId, setUserId] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("Izin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetch("/api/users")
        .then(res => res.json())
        .then(res => {
          if (res.success) {
            setUsers(res.data);
          }
        });

      const today = new Date();
      const localDate = new Date(today.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
      const yyyy = localDate.getFullYear();
      const mm = String(localDate.getMonth() + 1).padStart(2, '0');
      const dd = String(localDate.getDate()).padStart(2, '0');
      setDate(${"$"}{yyyy}-{mm}-{dd});

      setUserId("");
      setStatus("Izin");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!userId || !date || !status) {
      setError("Semua kolom harus diisi");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/izin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, date, status }),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || "Gagal menyimpan data");
      }
    } catch (e) {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm bg-card border border-border p-5">
        <DialogHeader className="pb-3 border-b border-border">
          <DialogTitle className="text-sm font-semibold text-foreground">Input Manual / Izin</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {error && <div className="text-destructive text-xs font-mono p-2 bg-destructive/10 border border-destructive/20">{error}</div>}

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Karyawan</label>
            <Select value={userId} onValueChange={(val) => setUserId(val || "")}>
              <SelectTrigger className="w-full border-border bg-background text-xs font-mono h-8">
                <SelectValue placeholder="Pilih..." />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Tanggal</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-8 text-xs font-mono bg-background border-border"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Status</label>
            <Select value={status} onValueChange={(val) => setStatus(val || "")}>
              <SelectTrigger className="w-full border-border bg-background text-xs font-mono h-8">
                <SelectValue placeholder="Pilih..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Izin">Izin</SelectItem>
                <SelectItem value="Sakit">Sakit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button variant="ghost" onClick={onClose} className="text-xs font-mono">Batal</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-mono h-8 px-4">
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
