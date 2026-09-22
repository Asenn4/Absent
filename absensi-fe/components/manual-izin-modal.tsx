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
      
      // Default date to today
      const today = new Date();
      const localDate = new Date(today.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
      const yyyy = localDate.getFullYear();
      const mm = String(localDate.getMonth() + 1).padStart(2, '0');
      const dd = String(localDate.getDate()).padStart(2, '0');
      setDate(`${yyyy}-${mm}-${dd}`);
      
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
      <DialogContent className="sm:max-w-md bg-white border-blue-100 rounded-2xl shadow-xl">
        <DialogHeader className="p-6 pb-2 border-b border-blue-100">
          <DialogTitle className="text-xl font-bold text-blue-900">Input Manual / Izin</DialogTitle>
        </DialogHeader>
        
        <div className="p-6 space-y-4">
          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-blue-900">Nama Karyawan</label>
            <Select value={userId} onValueChange={(val) => setUserId(val || "")}>
              <SelectTrigger className="w-full border-blue-200">
                <SelectValue placeholder="Pilih Karyawan" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-blue-900">Tanggal</label>
            <Input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="border-blue-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-blue-900">Status</label>
            <Select value={status} onValueChange={(val) => setStatus(val || "")}>
              <SelectTrigger className="w-full border-blue-200">
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Izin">Izin</SelectItem>
                <SelectItem value="Sakit">Sakit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="p-6 pt-2">
          <Button variant="outline" onClick={onClose} className="border-blue-200 text-blue-700">Batal</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
