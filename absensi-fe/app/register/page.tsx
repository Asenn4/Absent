"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccessMsg("Pendaftaran berhasil! Mengarahkan ke halaman login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setErrorMsg(data.error || "Gagal mendaftar");
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="w-full max-w-sm bg-card border border-border z-10 shadow-2xl flex flex-col">
        <div className="border-b border-border p-6 flex flex-col items-center">
          <div className="w-12 h-12 bg-primary flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground font-mono uppercase tracking-widest text-center">
            Register Akun
          </h1>
          <p className="text-[10px] font-mono text-muted-foreground mt-1">
            Bergabung dengan sistem absensi
          </p>
        </div>

        <div className="p-6 flex-1">
          <form onSubmit={handleRegister} className="space-y-4">
            {errorMsg && (
              <div className="bg-destructive/10 text-destructive text-xs font-mono p-3 border border-destructive/20 text-center">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="bg-primary/10 text-primary text-xs font-mono p-3 border border-primary/20 text-center">
                {successMsg}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="nama" className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Nama Lengkap</Label>
              <Input
                id="nama"
                type="text"
                placeholder="NAMA LENGKAP"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="bg-background border-border text-xs font-mono h-10 rounded-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="EMAIL@EXAMPLE.COM"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-border text-xs font-mono h-10 rounded-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Password</Label>
              <Input
                id="password"
                type="password"
                required
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border-border text-xs font-mono h-10 rounded-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                disabled={loading}
              />
            </div>
            <div className="pt-2">
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs h-10 rounded-none uppercase tracking-widest font-bold transition-colors" disabled={loading}>
                {loading ? "MEMPROSES..." : "DAFTAR"}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[10px] font-mono text-muted-foreground">
              SUDAH MEMILIKI AKUN? <Link href="/login" className="text-primary font-bold hover:underline">MASUK</Link>
            </p>
          </div>
        </div>

        <div className="border-t border-border p-3 text-center bg-muted/20">
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
            Sistem didukung oleh ClockIn.id AI
          </p>
        </div>
      </div>
    </div>
  );
}
