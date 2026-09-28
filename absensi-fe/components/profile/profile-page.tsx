"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, ScanFace, CheckCircle2 } from "lucide-react";

export function ProfilePageContent() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Profil Saya</h1>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">informasi akun & biometrik</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Avatar card */}
        <div className="border border-border bg-card p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-muted border border-border flex items-center justify-center mb-4">
            <span className="text-2xl font-mono font-bold text-foreground">
              {user.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-foreground">{user.name}</h3>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-1">
            {user.role === 'admin' ? 'ADMINISTRATOR' : 'SISWA'}
          </span>
        </div>

        {/* Info & Face Status */}
        <div className="md:col-span-2 space-y-4">
          <div className="border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Informasi Pribadi</h2>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Nama</Label>
                <Input defaultValue={user.name} className="h-8 text-xs font-mono bg-background border-border" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Email</Label>
                <Input type="email" defaultValue={user.email} readOnly className="h-8 text-xs font-mono bg-background border-border opacity-60" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Role</Label>
                <Input defaultValue={user.role === 'admin' ? 'Administrator' : 'Siswa'} disabled className="h-8 text-xs font-mono bg-background border-border opacity-40" />
              </div>
              <div className="pt-2 flex justify-end">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-mono h-8 px-4 gap-1.5">
                  <Save className="w-3.5 h-3.5" /> Simpan
                </Button>
              </div>
            </div>
          </div>

          <div className="border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">Status Wajah</h2>
              <ScanFace className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono text-primary border border-primary/30 px-1.5 py-0.5 inline-flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> Terdaftar
              </span>
            </div>
            <p className="text-[10px] font-mono text-muted-foreground">
              Wajah terdaftar dan siap untuk pemindaian absensi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
