"use client";

import { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createUser, updateUserRole, deleteUser, updateUserEmail, resetUserPassword } from "@/actions/users";
import type { ActionResult } from "@/types";
import { ROLE_LABELS, type Role } from "@/lib/constants";
import { PlusIcon, Loader2, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar_url: string | null;
  created_at: string;
}

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users: initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ROLES: { value: Role; label: string }[] = [
    { value: "ADMIN", label: "Admin" },
    { value: "TEACHER", label: "Guru" },
    { value: "STUDENT", label: "Santri" },
  ];

  const getRoleBadgeVariant = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return "destructive";
      case "TEACHER":
        return "default";
      case "STUDENT":
        return "secondary";
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!name || name.length < 2) {
      toast.error("Nama minimal 2 karakter");
      setIsSubmitting(false);
      return;
    }
    if (!email || !email.includes("@")) {
      toast.error("Email tidak valid");
      setIsSubmitting(false);
      return;
    }
    if (!password || password.length < 6) {
      toast.error("Password minimal 6 karakter");
      setIsSubmitting(false);
      return;
    }

    const result: ActionResult = await createUser(formData);

    if (result.success) {
      toast.success("User berhasil dibuat");
      setIsCreateOpen(false);
      window.location.reload();
    } else if (result.errors) {
      const firstFieldError = Object.values(result.errors).flat()[0];
      toast.error(firstFieldError ?? "Gagal membuat user");
    } else {
      toast.error(result.error ?? "Gagal membuat user");
    }
    setIsSubmitting(false);
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("role", newRole);

    const result = await updateUserRole(formData);

    if (result.success) {
      toast.success("Role berhasil diubah");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } else {
      toast.error(result.error ?? "Gagal mengubah role");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (userId: string) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("user_id", userId);

    const result = await deleteUser(formData);

    if (result.success) {
      toast.success("User berhasil dihapus");
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } else {
      toast.error(result.error ?? "Gagal menghapus user");
    }
    setDeleteDialogOpen(null);
    setIsSubmitting(false);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editTarget) return;
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const newEmail = String(formData.get("email") || "").trim();
    const newPassword = String(formData.get("password") || "");
    const isEmailChanged =
      newEmail.toLowerCase() !== editTarget.email.toLowerCase();

    // Email update (no-op jika tidak berubah)
    if (isEmailChanged) {
      const emailData = new FormData();
      emailData.append("user_id", editTarget.id);
      emailData.append("email", newEmail);
      const emailResult: ActionResult = await updateUserEmail(emailData);
      if (!emailResult.success) {
        toast.error(emailResult.error ?? "Gagal mengubah email");
        setIsSubmitting(false);
        return;
      }
    }

    // Password hanya jika diisi
    if (newPassword) {
      if (newPassword.length < 6) {
        toast.error("Password minimal 6 karakter");
        setIsSubmitting(false);
        return;
      }
      const pwData = new FormData();
      pwData.append("user_id", editTarget.id);
      pwData.append("password", newPassword);
      const pwResult: ActionResult = await resetUserPassword(pwData);
      if (!pwResult.success) {
        toast.error(pwResult.error ?? "Gagal mengatur ulang password");
        setIsSubmitting(false);
        return;
      }
    }

    toast.success("User berhasil diperbarui");
    setEditTarget(null);
    // Update state lokal (pola sama dengan role change — tanpa reload penuh)
    setUsers((prev) =>
      prev.map((u) =>
        u.id === editTarget.id
          ? { ...u, email: isEmailChanged ? newEmail : u.email }
          : u
      )
    );
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4">
      {/* Header with add button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 size-4" />
              Tambah User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah User Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Nama lengkap"
                  required
                  minLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@domain.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  minLength={6}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue="STUDENT">
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Batal
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">#</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-auto md:w-[160px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  Belum ada user
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell className="text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                        {user.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.avatar_url}
                            alt={user.name}
                            className="size-full rounded-full object-cover"
                          />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Edit email / password */}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-foreground"
                        disabled={isSubmitting}
                        onClick={() => setEditTarget(user)}
                        title="Edit email / password"
                      >
                        <Pencil className="size-4" />
                        <span className="sr-only">Edit</span>
                      </Button>

                      {/* Role dropdown */}
                      <Select
                        value={user.role}
                        onValueChange={(value) =>
                          handleRoleChange(user.id, value as Role)
                        }
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="w-[90px] sm:w-[110px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Delete button */}
                      <AlertDialog
                        open={deleteDialogOpen === user.id}
                        onOpenChange={(open) => {
                          if (!open) setDeleteDialogOpen(null);
                        }}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            disabled={isSubmitting}
                            onClick={() => setDeleteDialogOpen(user.id)}
                          >
                            <Trash2 className="size-4" />
                            <span className="sr-only">Hapus</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus User?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini tidak dapat dibatalkan. User{" "}
                              <strong>{user.name}</strong> akan dihapus permanen
                              beserta data terkait.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(user.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit email / password dialog */}
      <Dialog open={editTarget !== null} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {editTarget?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                defaultValue={editTarget?.email}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Password Baru (opsional)</Label>
              <Input
                id="edit-password"
                name="password"
                type="password"
                placeholder="Kosongkan jika tidak ingin mengubah"
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditTarget(null)}
                className="w-full sm:w-auto"
              >
                Batal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}