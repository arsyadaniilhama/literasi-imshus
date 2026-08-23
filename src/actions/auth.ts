"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/lib/validations";
import { getDashboardPath } from "@/lib/auth/session";
import type { ActionResult } from "@/types";

/**
 * Login with email/password via Supabase Auth.
 */
export async function login(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData);
  const parsed = loginSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      success: false,
      error: error.message === "Invalid login credentials"
        ? "Email atau password salah"
        : error.message,
    };
  }

  // Dapatkan user dari database untuk role
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (authUser?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
    });
    if (dbUser) {
      redirect(getDashboardPath(dbUser.role as "ADMIN" | "TEACHER" | "STUDENT"));
    }
  }

  redirect("/dashboard/student");
}

/**
 * Register (sign up) — membuat akun Supabase + user di database.
 */
export async function register(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData);
  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createClient();

  // 1. Buat user di Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { name: parsed.data.name },
    },
  });

  if (authError) {
    return { success: false, error: authError.message };
  }

  const authUserId = authData.user?.id;
  if (!authUserId) {
    return { success: false, error: "Gagal membuat akun" };
  }

  // 2. Buat user di database Prisma
  try {
    await prisma.user.create({
      data: {
        id: authUserId,
        name: parsed.data.name,
        email: parsed.data.email,
        role: "STUDENT",
      },
    });
  } catch {
    // Mungkin email sudah terdaftar oleh Supabase trigger
    // Lanjutkan saja
  }

  // 3. Untuk MVP, langsung redirect ke login
  // (Supabase default: email confirmation disabled)
  redirect("/login");
}

/**
 * Logout — hapus session Supabase.
 */
export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}