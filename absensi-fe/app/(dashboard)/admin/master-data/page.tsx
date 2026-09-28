"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Upload, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Users,
  RefreshCw,
  X
} from "lucide-react";

export default function MasterData() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Form states untuk Tambah Pengguna
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [newPassword, setNewPassword] = useState("");
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newPhotoPreview, setNewPhotoPreview] = useState<string | null>(null);

  // Form states untuk Edit Pengguna
  const [editUser, setEditUser] = useState<any>(null);
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const addFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error("Gagal memuat pengguna:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isEdit) {
        setEditPhotoFile(file);
        setEditPhotoPreview(URL.createObjectURL(file));
      } else {
        setNewPhotoFile(file);
        setNewPhotoPreview(URL.createObjectURL(file));
      }
    }
  };

  const resetAddForm = () => {
    setNewName("");
    setNewEmail("");
    setNewPassword("");
    setNewRole("user");
    setNewPhotoFile(null);
    setNewPhotoPreview(null);
    setErrorMessage("");
    if (addFileInputRef.current) addFileInputRef.current.value = "";
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("nama", newName);
      formData.append("email", newEmail);
      formData.append("role", newRole);
      formData.append("password", newPassword || "123456");
      if (newPhotoFile) {
        formData.append("photo", newPhotoFile);
      }

      const res = await fetch("/api/users", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setIsAddOpen(false);
        resetAddForm();
        setSuccessMessage(data.message || "Pengguna berhasil ditambahkan!");
        fetchUsers();
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setErrorMessage(data.error || "Gagal menambahkan pengguna.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("nama", editUser.nama);
      formData.append("email", editUser.email);
      formData.append("role", editUser.role);
      if (editPhotoFile) {
        formData.append("photo", editPhotoFile);
      }

      const res = await fetch(/api/users/{editUser.id}, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setIsEditOpen(false);
        setEditUser(null);
        setEditPhotoFile(null);
        setEditPhotoPreview(null);
        setSuccessMessage("Data pengguna berhasil diperbarui!");
        fetchUsers();
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setErrorMessage(data.error || "Gagal mengedit pengguna.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(Yakin ingin menghapus {name}? Seluruh riwayat presensi & data wajah akan dihapus.)) return;
    try {
      const res = await fetch(/api/users/{userId}, { method: "DELETE" });
      if (res.ok) {
        setSuccessMessage(Pengguna {name} berhasil dihapus.);
        fetchUsers();
        setTimeout(() => setSuccessMessage(""), 4000);
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus pengguna.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menghapus.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Data Master</h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">kelola pengguna & data biometrik</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) resetAddForm();
        }}>
          <DialogTrigger render={
            <Button variant="outline" className="gap-1.5 text-xs font-mono h-8">
              <Plus className="w-3.5 h-3.5" /> Tambah User
            </Button>
          } />
          <DialogContent className="sm:max-w-[480px] bg-card border border-border p-5">
            <DialogHeader className="pb-3 border-b border-border">
              <DialogTitle className="text-sm font-semibold text-foreground">Tambah Pengguna Baru</DialogTitle>
              <p className="text-[10px] font-mono text-muted-foreground mt-0.5">Daftarkan siswa/admin baru ke sistem</p>
            </DialogHeader>

            <form onSubmit={handleAdd} className="space-y-3 pt-3">
              {errorMessage && (
                <div className="p-2 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Upload Foto */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Foto Wajah</Label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-muted border border-border flex items-center justify-center overflow-hidden">
                    {newPhotoPreview ? (
                      <img src={newPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <input
                      ref={addFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoSelect(e, false)}
                      className="hidden"
                      id="add-photo-input"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addFileInputRef.current?.click()}
                      className="text-[10px] font-mono h-7 gap-1"
                    >
                      <Upload className="w-3 h-3" /> Upload
                    </Button>
                    <p className="text-[10px] font-mono text-muted-foreground">Opsional. Vektor AI diekstrak otomatis.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Nama</Label>
                <Input value={newName} onChange={e => setNewName(e.target.value)} required className="h-8 text-xs font-mono bg-background border-border" />
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Email / NIS</Label>
                <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required className="h-8 text-xs font-mono bg-background border-border" />
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Password</Label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Default: 123456" className="h-8 text-xs font-mono bg-background border-border" />
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Role</Label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  className="w-full h-8 px-2 text-xs font-mono bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="user">Siswa</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} disabled={isSubmitting} className="text-xs font-mono">
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-mono h-8 px-4 gap-1.5">
                  {isSubmitting ? (
                    <><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>Menyimpan...</span></>
                  ) : (
                    <span>Simpan</span>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Success Toast */}
      {successMessage && (
        <div className="bg-primary/10 border border-primary/20 text-primary text-xs font-mono p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage("")} className="text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="border border-border bg-card">
        <div className="border-b border-border p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">{users.length} pengguna terdaftar</span>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest w-12">#</TableHead>
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Nama</TableHead>
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Email</TableHead>
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest text-center">Role</TableHead>
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest text-center">Face AI</TableHead>
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs font-mono text-muted-foreground">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs font-mono text-muted-foreground">
                  Belum ada data pengguna.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, index) => {
                const hasFace = user.face_embed && user.face_embed !== "null" && user.face_embed !== "[]";
                const photoUrl = user.photo_url ? /api/users/{user.id}/photo : null;

                return (
                  <TableRow key={user.id} className="border-border hover:bg-muted/30 transition-colors">
                    <TableCell className="text-[10px] font-mono text-muted-foreground">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-muted border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                          {photoUrl ? (
                            <img src={photoUrl} alt={user.nama} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[9px] font-mono font-bold text-muted-foreground">{user.nama?.substring(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <span className="text-xs font-medium text-foreground">{user.nama}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{user.email}</TableCell>
                    <TableCell className="text-center">
                      <span className={	ext-[10px] font-mono font-medium border px-1.5 py-0.5 {user.role === "admin" ? "text-amber-500 border-amber-500/30" : "text-muted-foreground border-border"}}>
                        {user.role === "admin" ? "ADMIN" : "SISWA"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {hasFace ? (
                        <span className="text-[10px] font-mono text-primary border border-primary/30 px-1.5 py-0.5 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> OK
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <button
                        onClick={() => {
                          setEditUser({ ...user });
                          setEditPhotoFile(null);
                          setEditPhotoPreview(photoUrl || null);
                          setErrorMessage("");
                          setIsEditOpen(true);
                        }}
                        className="text-[10px] font-mono text-primary hover:underline"
                      >
                        edit
                      </button>
                      <span className="text-muted-foreground">|</span>
                      <button
                        onClick={() => handleDelete(user.id, user.nama)}
                        className="text-[10px] font-mono text-destructive hover:underline"
                      >
                        hapus
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Edit Pengguna & Update Foto */}
      <Dialog open={isEditOpen} onOpenChange={(open) => {
        setIsEditOpen(open);
        if (!open) {
          setEditUser(null);
          setEditPhotoFile(null);
          setEditPhotoPreview(null);
          setErrorMessage("");
        }
      }}>
        <DialogContent className="sm:max-w-[480px] bg-card border border-border p-5">
          <DialogHeader className="pb-3 border-b border-border">
            <DialogTitle className="text-sm font-semibold text-foreground">Edit Data & Foto</DialogTitle>
            <p className="text-[10px] font-mono text-muted-foreground mt-0.5">Perbarui informasi atau unggah foto wajah baru</p>
          </DialogHeader>

          {editUser && (
            <form onSubmit={handleEdit} className="space-y-3 pt-3">
              {errorMessage && (
                <div className="p-2 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Upload Foto */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Foto Wajah</Label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-muted border border-border flex items-center justify-center overflow-hidden">
                    {editPhotoPreview ? (
                      <img src={editPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoSelect(e, true)}
                      className="hidden"
                      id="edit-photo-input"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => editFileInputRef.current?.click()}
                      className="text-[10px] font-mono h-7 gap-1"
                    >
                      <Upload className="w-3 h-3" /> Upload / Ganti
                    </Button>
                    <p className="text-[10px] font-mono text-muted-foreground">Vektor biometrik diekstrak ulang otomatis.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Nama</Label>
                <Input
                  value={editUser.nama}
                  onChange={e => setEditUser({ ...editUser, nama: e.target.value })}
                  required
                  className="h-8 text-xs font-mono bg-background border-border"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Email / NIS</Label>
                <Input
                  type="email"
                  value={editUser.email}
                  onChange={e => setEditUser({ ...editUser, email: e.target.value })}
                  required
                  className="h-8 text-xs font-mono bg-background border-border"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Role</Label>
                <select
                  value={editUser.role}
                  onChange={e => setEditUser({ ...editUser, role: e.target.value })}
                  className="w-full h-8 px-2 text-xs font-mono bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="user">Siswa</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} disabled={isSubmitting} className="text-xs font-mono">
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-mono h-8 px-4 gap-1.5">
                  {isSubmitting ? (
                    <><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>Menyimpan...</span></>
                  ) : (
                    <span>Simpan</span>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
