"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { updateProfileSchema, changePasswordSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

/**
 * Santri: ubah nama + email (data diri).
 * Nama & email disimpan di Prisma; email juga di-update di Supabase Auth.
 */
export async function updateProfile(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireStudent();
  const raw = Object.fromEntries(formData);
  const parsed = updateProfileSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, email } = parsed.data;

  try {
    const supabase = await createClient();

    // Update Supabase Auth: metadata name selalu; email hanya jika berubah
    const updates: { email?: string; data: { name: string } } = {
      data: { name },
    };
    if (email !== user.email) updates.email = email;

    const { error: authError } = await supabase.auth.updateUser(updates);
    if (authError) {
      return {
        success: false,
        error:
          authError.message === "User already registered"
            ? "Email sudah terdaftar."
            : authError.message,
      };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { name, email },
    });

    revalidatePath("/dashboard/student/profile");
    return { success: true };
  } catch (error) {
    console.error("updateProfile error:", error);
    return { success: false, error: "Terjadi kesalahan saat memperbarui profil." };
  }
}

/**
 * Santri: ubah password.
 * Verifikasi password saat ini via signInWithPassword, lalu update di Supabase Auth.
 */
export async function changePassword(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireStudent();
  const raw = Object.fromEntries(formData);
  const parsed = changePasswordSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { current_password, new_password, confirm_password } = parsed.data;

  if (new_password !== confirm_password) {
    return { success: false, error: "Konfirmasi password tidak cocok." };
  }

  try {
    const supabase = await createClient();

    // Verifikasi password lama
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: current_password,
    });
    if (signInError) {
      return { success: false, error: "Password saat ini salah." };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: new_password,
    });
    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    console.error("changePassword error:", error);
    return { success: false, error: "Terjadi kesalahan saat mengganti password." };
  }
}
