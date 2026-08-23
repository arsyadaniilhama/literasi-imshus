"use client";

import { useActionState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { updateProfile, changePassword } from "@/actions/profile";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Loader2, Mail, UserRound } from "lucide-react";
import type { Role } from "@/types";

interface ProfileClientProps {
  user: {
    name: string;
    email: string;
    role: Role;
    created_at: string;
  };
}

const emptyState = { success: false, error: undefined, errors: undefined };

export function ProfileClient({ user }: ProfileClientProps) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateProfile,
    emptyState
  );
  const [passwordState, passwordAction, passwordPending] = useActionState(
    changePassword,
    emptyState
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Data Diri */}
      <Card className="backdrop-blur-sm bg-card/80 border-primary/10">
        <CardHeader>
          <CardTitle className="font-heading text-lg font-semibold">
            Data Diri
          </CardTitle>
          <CardDescription>
            Nama dan email yang tampil di platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Info ringkas */}
          <div className="mb-6 flex items-center gap-4 rounded-xl border border-primary/10 bg-primary/5 p-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-heading truncate text-base font-semibold">
                {user.name}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {user.email}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {ROLE_LABELS[user.role]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Terdaftar {formatDate(user.created_at)}
                </span>
              </div>
            </div>
          </div>

          <form action={profileAction} className="space-y-4">
            {profileState.success && (
              <div className="rounded-md bg-primary/10 p-3 text-sm text-primary" role="status">
                Profil berhasil diperbarui.
              </div>
            )}
            {profileState.error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                {profileState.error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={user.name}
                  required
                  className="pl-9"
                />
              </div>
              {profileState.errors?.name && (
                <p className="text-sm text-destructive" role="alert">
                  {profileState.errors.name[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={user.email}
                  required
                  className="pl-9"
                />
              </div>
              {profileState.errors?.email && (
                <p className="text-sm text-destructive" role="alert">
                  {profileState.errors.email[0]}
                </p>
              )}
            </div>

            <Button type="submit" disabled={profilePending}>
              {profilePending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Ubah Password */}
      <Card className="backdrop-blur-sm bg-card/80 border-primary/10">
        <CardHeader>
          <CardTitle className="font-heading text-lg font-semibold">
            Ubah Password
          </CardTitle>
          <CardDescription>
            Ganti password akun Anda untuk keamanan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={passwordAction} className="space-y-4">
            {passwordState.success && (
              <div className="rounded-md bg-primary/10 p-3 text-sm text-primary" role="status">
                Password berhasil diubah.
              </div>
            )}
            {passwordState.error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                {passwordState.error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="current_password">Password Saat Ini</Label>
              <Input
                id="current_password"
                name="current_password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
              />
              {passwordState.errors?.current_password && (
                <p className="text-sm text-destructive" role="alert">
                  {passwordState.errors.current_password[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password">Password Baru</Label>
              <Input
                id="new_password"
                name="new_password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Minimal 6 karakter"
              />
              {passwordState.errors?.new_password && (
                <p className="text-sm text-destructive" role="alert">
                  {passwordState.errors.new_password[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Konfirmasi Password Baru</Label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Ulangi password baru"
              />
              {passwordState.errors?.confirm_password && (
                <p className="text-sm text-destructive" role="alert">
                  {passwordState.errors.confirm_password[0]}
                </p>
              )}
            </div>

            <Button type="submit" disabled={passwordPending}>
              {passwordPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengubah...
                </>
              ) : (
                "Ubah Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
