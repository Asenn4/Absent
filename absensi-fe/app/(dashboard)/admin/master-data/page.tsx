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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Upload, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Users,
  RefreshCw,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  // Handle pilih file foto tambah user
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

  // Reset form tambah user
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

  // Simpan Pengguna Baru
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

  // Simpan Edit Pengguna
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

      const res = await fetch(`/api/users/${editUser.id}`, {
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

  // Hapus Pengguna
  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus ${name}? Seluruh riwayat presensi & data wajah akan dihapus.`)) return;
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setSuccessMessage(`Pengguna ${name} berhasil dihapus.`);
        fetchUsers();
        setTimeout(() => setSuccessMessage(""), 4000);
      } else {
        alert("Gagal menghapus user.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Master Data Pengguna</h1>
          <p className="text-blue-700/70 mt-1 font-medium text-sm">
            Daftarkan siswa/pengguna beserta foto wajah untuk sistem presensi AI Kiosk.
          </p>
        </div>
        
        {/* Dialog Tambah Pengguna Baru */}
        <Dialog open={isAddOpen} onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) resetAddForm();
        }}>
          <DialogTrigger
            render={
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-extrabold gap-2 px-5 py-2.5 rounded-xl shadow-md shadow-yellow-400/20 active:scale-95 transition-all">
                <Plus className="w-5 h-5" /> Tambah Siswa & Foto Wajah
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[550px] rounded-2xl bg-white border border-blue-100 p-6 shadow-2xl">
            <DialogHeader className="pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-blue-950">Daftarkan Siswa Baru</DialogTitle>
                  <p className="text-xs text-slate-500 mt-0.5">Input data dan unggah foto wajah siswa untuk model AI</p>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleAdd} className="space-y-4 pt-3">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Upload Foto Wajah */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Foto Wajah Siswa (AI Model)</Label>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-blue-200 flex items-center justify-center overflow-hidden group">
                    {newPhotoPreview ? (
                      <>
                        <img src={newPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setNewPhotoFile(null);
                            setNewPhotoPreview(null);
                            if (addFileInputRef.current) addFileInputRef.current.value = "";
                          }}
                          className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Camera className="w-6 h-6 mb-1 text-blue-400" />
                        <span className="text-[10px] font-medium">Unggah</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
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
                      className="text-xs font-bold text-blue-700 border-blue-200 hover:bg-blue-50 flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" /> Pilih File Foto
                    </Button>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Gunakan foto portrait wajah yang jelas, menghadap kamera, dan berpenerangan baik.
                    </p>
                  </div>
                </div>
              </div>

              {/* Input Data Siswa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="add-name" className="text-xs font-bold text-slate-700">Nama Lengkap *</Label>
                  <Input 
                    id="add-name" 
                    required 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)} 
                    placeholder="Contoh: Budi Santoso"
                    className="h-10 text-xs rounded-xl border-slate-200 focus-visible:ring-blue-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="add-email" className="text-xs font-bold text-slate-700">Email / NIS *</Label>
                  <Input 
                    id="add-email" 
                    type="email" 
                    required 
                    value={newEmail} 
                    onChange={e => setNewEmail(e.target.value)} 
                    placeholder="budi@sekolah.sch.id" 
                    className="h-10 text-xs rounded-xl border-slate-200 focus-visible:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="add-role" className="text-xs font-bold text-slate-700">Role</Label>
                  <select
                    id="add-role"
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-white rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="user">Siswa / Pengguna Biasa</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="add-password" className="text-xs font-bold text-slate-700">Password (Opsional)</Label>
                  <Input 
                    id="add-password" 
                    type="password" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    placeholder="Default: 123456" 
                    className="h-10 text-xs rounded-xl border-slate-200 focus-visible:ring-blue-600"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center gap-2 text-xs text-blue-900">
                <Sparkles className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                <span>AI akan otomatis mengekstrak 512 fitur biometrik wajah begitu disimpan.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsAddOpen(false)} 
                  disabled={isSubmitting}
                  className="text-xs font-medium text-slate-600"
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 h-10 rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Memproses AI...</span>
                    </>
                  ) : (
                    <span>Simpan & Daftarkan Wajah</span>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alert Sukses */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tabel Master Data */}
      <Card className="bg-white border border-blue-100 shadow-sm rounded-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/70 border-b border-blue-50">
            <TableRow>
              <TableHead className="font-bold text-blue-950 text-xs">Profil & Wajah</TableHead>
              <TableHead className="font-bold text-blue-950 text-xs">Nama Lengkap</TableHead>
              <TableHead className="font-bold text-blue-950 text-xs">Email / NIS</TableHead>
              <TableHead className="font-bold text-blue-950 text-xs">Role</TableHead>
              <TableHead className="font-bold text-blue-950 text-xs text-center">Status Model AI</TableHead>
              <TableHead className="font-bold text-blue-950 text-xs text-right pr-6">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-slate-400 text-xs font-medium">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                    <span>Memuat data pengguna...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                  Belum ada pengguna terdaftar. Klik tombol Tambah di atas untuk mendaftarkan siswa.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const photoUrl = user.face_reqs?.[0]?.photo_url;
                const hasFace = !!user.face_embed;

                return (
                  <TableRow key={user.id} className="hover:bg-blue-50/30 transition-colors">
                    <TableCell className="py-3">
                      <Avatar className="h-10 w-10 border border-blue-100 shadow-sm">
                        {photoUrl && <AvatarImage src={photoUrl} alt={user.nama} className="object-cover" />}
                        <AvatarFallback className="bg-gradient-to-br from-blue-700 to-blue-900 text-white font-bold text-xs">
                          {user.nama ? user.nama.substring(0, 2).toUpperCase() : "US"}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-bold text-slate-800 text-xs">{user.nama}</TableCell>
                    <TableCell className="text-slate-600 text-xs">{user.email}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={user.role === "admin" 
                          ? "bg-blue-50 text-blue-700 border-blue-200 font-bold text-[10px]" 
                          : "bg-slate-50 text-slate-700 border-slate-200 font-medium text-[10px]"
                        }
                      >
                        {user.role === "admin" ? "ADMIN" : "SISWA"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {hasFace ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] gap-1 px-2.5 py-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> AI Terdaftar
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 text-[10px]">
                          Belum Ada Foto
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2 pr-6">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setEditUser({ ...user });
                          setEditPhotoFile(null);
                          setEditPhotoPreview(photoUrl || null);
                          setErrorMessage("");
                          setIsEditOpen(true);
                        }}
                        className="text-xs font-bold text-blue-700 border-blue-200 hover:bg-blue-50 h-8 rounded-lg"
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1" /> Edit / Foto
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(user.id, user.nama)}
                        className="text-xs font-bold text-red-600 border-red-200 hover:bg-red-50 h-8 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

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
        <DialogContent className="sm:max-w-[550px] rounded-2xl bg-white border border-blue-100 p-6 shadow-2xl">
          <DialogHeader className="pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                <Pencil className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-blue-950">Edit Data & Foto Wajah</DialogTitle>
                <p className="text-xs text-slate-500 mt-0.5">Perbarui informasi siswa atau unggah foto wajah baru</p>
              </div>
            </div>
          </DialogHeader>

          {editUser && (
            <form onSubmit={handleEdit} className="space-y-4 pt-3">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Upload Foto Baru */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Foto Wajah Siswa</Label>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-blue-200 flex items-center justify-center overflow-hidden">
                    {editPhotoPreview ? (
                      <img src={editPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Camera className="w-6 h-6 mb-1 text-blue-400" />
                        <span className="text-[10px] font-medium">Kosong</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
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
                      className="text-xs font-bold text-blue-700 border-blue-200 hover:bg-blue-50 flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" /> Unggah / Ganti Foto
                    </Button>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Pilih foto wajah baru untuk mengekstrak ulang vektor biometrik.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Nama Lengkap</Label>
                <Input 
                  value={editUser.nama} 
                  onChange={e => setEditUser({ ...editUser, nama: e.target.value })} 
                  required 
                  className="h-10 text-xs rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Email / NIS</Label>
                <Input 
                  type="email" 
                  value={editUser.email} 
                  onChange={e => setEditUser({ ...editUser, email: e.target.value })} 
                  required 
                  className="h-10 text-xs rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Role</Label>
                <select
                  value={editUser.role}
                  onChange={e => setEditUser({ ...editUser, role: e.target.value })}
                  className="w-full h-10 px-3 text-xs bg-white rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="user">Siswa / Pengguna Biasa</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsEditOpen(false)} 
                  disabled={isSubmitting}
                  className="text-xs font-medium text-slate-600"
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 h-10 rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
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
