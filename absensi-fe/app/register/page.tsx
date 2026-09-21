"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, UserPlus } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md bg-white border-none shadow-xl">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800 tracking-tight">
            Daftar Akun Baru
          </CardTitle>
          <CardDescription className="text-slate-500">
            Bergabunglah dengan sistem absensi cerdas kami
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {errorMsg && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-200">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="bg-green-50 text-green-600 text-sm p-3 rounded-md border border-green-200">
                {successMsg}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Lengkap</Label>
              <Input
                id="nama"
                type="text"
                placeholder="John Doe"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="bg-slate-50 border-slate-200 focus-visible:ring-blue-600"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-50 border-slate-200 focus-visible:ring-blue-600"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-50 border-slate-200 focus-visible:ring-blue-600"
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-11" disabled={loading}>
              {loading ? "Memproses..." : "Daftar"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Sudah memiliki akun? <Link href="/login" className="text-blue-600 font-bold hover:underline">Masuk di sini</Link>
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-100 pt-6 pb-6">
          <p className="text-xs text-slate-400">
            Sistem didukung oleh Jetson Nano AI
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
