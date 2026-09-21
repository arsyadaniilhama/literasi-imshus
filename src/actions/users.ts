"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { createUserSchema, updateUserEmailSchema, resetUserPasswordSchema } from "@/lib/validations";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { ActionResult } from "@/types";
import type { Role } from "@/types";

const ALLOWED_ROLES = ["STUDENT", "TEACHER", "ADMIN"];

/**
 * Admin: buat user baru — akun Supabase Auth + record di tabel users.
 */
export async function createUser(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const raw = Object.fromEntries(formData);
  const parsed = createUserSchema.safeParse({
    name: raw.name,
    email: raw.email,
    password: raw.password,
    role: raw.role || "STUDENT",
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, email, password, role } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { success: false, error: "Email sudah terdaftar." };

    // 1. Buat akun di Supabase Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
      });

    if (authError) {
      console.error("createUser supabase error:", authError.message);
      return { success: false, error: "Gagal membuat akun: " + authError.message };
    }

    const authUserId = authData.user?.id;
    if (!authUserId) {
      return { success: false, error: "Gagal membuat akun." };
    }

    // 2. Buat record di tabel users (id tersinkron dengan Supabase Auth)
    const created = await prisma.user.create({
      data: {
        id: authUserId,
        name,
        email: email.toLowerCase(),
        role: role as Role,
      },
    });

    await prisma.auditLog.create({
      data: {
        user_id: admin.id,
        action: "ADMIN_CREATED_USER",
        entity_type: "user",
        entity_id: created.id,
      },
    });

    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch (error) {
    console.error("createUser error:", error);
    return { success: false, error: "Terjadi kesalahan saat membuat user." };
  }
}

/**
 * Admin: ubah role user.
 */
export async function updateUserRole(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const userId = String(formData.get("user_id"));
  const role = String(formData.get("role")) as Role;

  if (!ALLOWED_ROLES.includes(role)) return { success: false, error: "Role tidak valid." };

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: "User tidak ditemukan." };
    if (user.role === "ADMIN" && role !== "ADMIN") {
      // Jangan biarkan admin terakhir menurunkan role dirinya sendiri
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1 && user.id === admin.id) {
        return { success: false, error: "Tidak dapat menurunkan role admin terakhir." };
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: role as "ADMIN" | "TEACHER" | "STUDENT" },
    });

    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch (error) {
    console.error("updateUserRole error:", error);
    return { success: false, error: "Terjadi kesalahan saat mengubah role." };
  }
}

/**
 * Admin: hapus user.
 */
export async function deleteUser(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const userId = String(formData.get("user_id"));

  if (userId === admin.id) return { success: false, error: "Tidak dapat menghapus akun sendiri." };

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: "User tidak ditemukan." };

    if (user.role === "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) return { success: false, error: "Tidak dapat menghapus admin terakhir." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.notification.deleteMany({ where: { user_id: userId } });
      await tx.user.delete({ where: { id: userId } });
    });

    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch (error) {
    console.error("deleteUser error:", error);
    return { success: false, error: "Terjadi kesalahan saat menghapus user." };
  }
}

/**
 * Admin: edit email user — sinkron ke Supabase Auth + Prisma.
 * Admin bypasses current password (pakai service-role admin client).
 */
export async function updateUserEmail(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = updateUserEmailSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { user_id, email } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await prisma.user.findUnique({ where: { id: user_id } });
    if (!user) return { success: false, error: "User tidak ditemukan." };

    // No-op: email tidak berubah
    if (user.email.toLowerCase() === normalizedEmail) {
      return { success: true };
    }

    // Pre-check duplikat di Prisma (friendly error)
    const duplicate = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (duplicate) return { success: false, error: "Email sudah terdaftar." };

    // Update Supabase Auth (admin client bypasses current-password).
    // email_confirm: true — akun tetap aktif (sama seperti createUser).
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      user_id,
      { email: normalizedEmail, email_confirm: true }
    );
    if (authError) {
      console.error("updateUserEmail supabase error:", authError.message);
      return { success: false, error: "Gagal mengubah email: " + authError.message };
    }

    // Sinkron Prisma
    await prisma.user.update({
      where: { id: user_id },
      data: { email: normalizedEmail },
    });

    await prisma.auditLog.create({
      data: {
        user_id: admin.id,
        action: "ADMIN_UPDATED_USER_EMAIL",
        entity_type: "user",
        entity_id: user_id,
      },
    });

    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch (error) {
    console.error("updateUserEmail error:", error);
    return { success: false, error: "Terjadi kesalahan saat mengubah email." };
  }
}

/**
 * Admin: reset password user — hanya di Supabase Auth (tidak ada Prisma).
 * Admin tidak perlu tahu current-password.
 */
export async function resetUserPassword(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = resetUserPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { user_id, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { id: user_id } });
    if (!user) return { success: false, error: "User tidak ditemukan." };

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      user_id,
      { password }
    );
    if (authError) {
      console.error("resetUserPassword supabase error:", authError.message);
      return {
        success: false,
        error: "Gagal mengatur ulang password: " + authError.message,
      };
    }

    // Password hanya di Supabase Auth — tidak perlu update Prisma

    await prisma.auditLog.create({
      data: {
        user_id: admin.id,
        action: "ADMIN_RESET_PASSWORD",
        entity_type: "user",
        entity_id: user_id,
      },
    });

    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch (error) {
    console.error("resetUserPassword error:", error);
    return { success: false, error: "Terjadi kesalahan saat mengatur ulang password." };
  }
}

/**
 * Admin: buat kategori.
 */
export async function createCategory(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const description = (formData.get("description") as string)?.trim() || null;

  if (!name) return { success: false, error: "Nama kategori harus diisi." };

  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `kategori-${Date.now()}`;
    await prisma.category.create({ data: { name, slug, description } });
    revalidatePath("/dashboard/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("createCategory error:", error);
    return { success: false, error: "Terjadi kesalahan saat membuat kategori." };
  }
}

/**
 * Admin: hapus kategori.
 */
export async function deleteCategory(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const categoryId = String(formData.get("category_id"));

  try {
    // Set articles to null category before deleting
    await prisma.article.updateMany({
      where: { category_id: categoryId },
      data: { category_id: null },
    });
    await prisma.category.delete({ where: { id: categoryId } });
    revalidatePath("/dashboard/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("deleteCategory error:", error);
    return { success: false, error: "Terjadi kesalahan saat menghapus kategori." };
  }
}
