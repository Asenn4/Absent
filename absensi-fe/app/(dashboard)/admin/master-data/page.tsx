"use client";

import { useState, useEffect } from "react";
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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function MasterData() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [newPassword, setNewPassword] = useState("");

  const [editUser, setEditUser] = useState<any>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: newName, email: newEmail, password: newPassword, role: newRole })
      });
      if (res.ok) {
        setIsAddOpen(false);
        setNewName(""); setNewEmail(""); setNewPassword(""); setNewRole("user");
        fetchUsers();
      } else {
        alert("Gagal menambahkan user");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    try {
      const res = await fetch(`/api/users/${editUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: editUser.nama, email: editUser.email, role: editUser.role })
      });
      if (res.ok) {
        setIsEditOpen(false);
        setEditUser(null);
        fetchUsers();
      } else {
        alert("Gagal mengedit user");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Yakin ingin menghapus pengguna ini?")) return;
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        fetchUsers();
      } else {
        alert("Gagal menghapus user");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Master Data</h1>
          <p className="text-blue-800/60 mt-1">Manage users and face recognition models.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger 
            render={<Button className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold gap-2 shadow-[0_0_15px_rgba(250,204,21,0.3)]" />}
          >
            <Plus className="w-4 h-4" /> Add New User
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" required value={newName} onChange={e => setNewName(e.target.value)} placeholder="John Doe" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="john@example.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Secret" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role (admin/user)</Label>
                  <Input id="role" required value={newRole} onChange={e => setNewRole(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Save changes</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white border-none shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-blue-50/50 border-b border-blue-100">
            <TableRow>
              <TableHead className="font-semibold text-blue-900">Name</TableHead>
              <TableHead className="font-semibold text-blue-900">Role</TableHead>
              <TableHead className="font-semibold text-blue-900">Email</TableHead>
              <TableHead className="font-semibold text-blue-900 text-center">Face Registered</TableHead>
              <TableHead className="font-semibold text-blue-900 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-4">Loading...</TableCell></TableRow>
            ) : users.map((user) => (
              <TableRow key={user.id} className="hover:bg-blue-50/30">
                <TableCell className="font-medium text-blue-900">{user.nama}</TableCell>
                <TableCell className="text-blue-800/70">
                  <Badge variant="outline" className={user.role === "admin" ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-700 border-slate-200"}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-blue-800/70">{user.email}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={user.face_embed ? "bg-blue-600 text-white border-blue-700" : "bg-white text-blue-400 border-blue-200"}>
                    {user.face_embed ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Dialog open={isEditOpen && editUser?.id === user.id} onOpenChange={(open) => {
                    if (open) {
                      setEditUser(user);
                      setIsEditOpen(true);
                    } else {
                      setIsEditOpen(false);
                      setEditUser(null);
                    }
                  }}>
                    <DialogTrigger 
                      render={<Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" />}
                    >
                      <Pencil className="w-4 h-4 mr-1" /> Edit
                    </DialogTrigger>
                    {editUser && editUser.id === user.id && (
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Edit Pengguna</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEdit}>
                          <div className="grid gap-4 py-4 text-left">
                            <div className="grid gap-2">
                              <Label>Nama Lengkap</Label>
                              <Input value={editUser.nama} onChange={e => setEditUser({...editUser, nama: e.target.value})} required />
                            </div>
                            <div className="grid gap-2">
                              <Label>Email</Label>
                              <Input type="email" value={editUser.email} onChange={e => setEditUser({...editUser, email: e.target.value})} required />
                            </div>
                            <div className="grid gap-2">
                              <Label>Role (admin/user)</Label>
                              <Input value={editUser.role} onChange={e => setEditUser({...editUser, role: e.target.value})} required />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 mt-2">
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                              Simpan Perubahan
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    )}
                  </Dialog>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(user.id)}
                    className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Hapus
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
