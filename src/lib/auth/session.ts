import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { Role, User } from "@/types";
import { ROLE_LABELS } from "@/lib/constants";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar_url: string | null;
}

/**
 * Ambil user saat ini dari Supabase session + data Prisma.
 * Return null jika tidak login.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar_url: user.avatar_url,
    role: user.role as Role,
    created_at: user.created_at.toISOString(),
    updated_at: user.updated_at.toISOString(),
  };
});

/** Wajib login — redirect ke /login jika tidak. */
export const requireUser = cache(async (): Promise<User> => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
});

/** Wajib role tertentu — redirect ke dashboard sesuai role jika tidak sesuai. */
export const requireRole = cache(
  async (allowedRoles: Role[]): Promise<User> => {
    const user = await requireUser();
    if (!allowedRoles.includes(user.role)) {
      redirect(getDashboardPath(user.role));
    }
    return user;
  }
);

/** Wajib role STUDENT */
export const requireStudent = cache(async () => {
  return requireRole(["STUDENT"]);
});

/** Wajib role TEACHER atau ADMIN */
export const requireTeacher = cache(async () => {
  return requireRole(["TEACHER", "ADMIN"]);
});

/** Wajib role ADMIN */
export const requireAdmin = cache(async () => {
  return requireRole(["ADMIN"]);
});

/** Route dashboard berdasarkan role */
export function getDashboardPath(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/dashboard/admin";
    case "TEACHER":
      return "/dashboard/teacher";
    case "STUDENT":
      return "/dashboard/student";
  }
}

export function roleLabel(role: Role): string {
  return ROLE_LABELS[role];
}

export interface SessionInfo {
  user: SessionUser | null;
}
