"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        window.location.replace(data.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
      } else {
        setErrorMsg(data.error || "Gagal login");
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="border border-border bg-card">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">JETSON_ATTEND</span>
            </div>
            <h1 className="text-lg font-semibold text-foreground">
              Administrator Login
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Masuk untuk mengelola master data siswa & presensi AI
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleManualLogin} className="space-y-4">
              {errorMsg && (
                <div className="bg-destructive/10 text-destructive text-xs p-3 border border-destructive/20 font-mono">
                  {errorMsg}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@jetson.ai"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-border text-foreground font-mono text-sm h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background border-border text-foreground font-mono text-sm h-9"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-xs uppercase tracking-widest h-9"
              >
                {loading ? "Memproses..." : "Masuk"}
              </Button>
            </form>

            {/* Quick Login Buttons for Development */}
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-1/2 text-[10px] font-mono h-7"
                onClick={() => {
                  setEmail("admin@jetson.ai");
                  setPassword("admin");
                }}
              >
                Fill Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-1/2 text-[10px] font-mono h-7"
                onClick={() => {
                  setEmail("user@jetson.ai");
                  setPassword("user");
                }}
              >
                Fill User
              </Button>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-border">
            <p className="text-[10px] text-muted-foreground font-mono text-center">
              Siswa tidak perlu login. Pendaftaran wajah dikelola oleh Administrator.
            </p>
            <div className="mt-2 text-center">
              <Link href="/" className="text-[10px] text-primary hover:underline font-mono">
                &larr; Terminal Absensi (Kiosk)
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
