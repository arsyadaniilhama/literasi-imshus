import { z } from "zod/v4";
import {
  MIN_TITLE_LENGTH,
  MIN_CONTENT_LENGTH,
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_MIME,
} from "@/lib/constants";

// ============================================================
// Zod schemas — validasi server-side (PRD #40)
// ============================================================

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password harus diisi"),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .max(100, "Password maksimal 100 karakter"),
});

export const createArticleSchema = z.object({
  title: z
    .string()
    .min(MIN_TITLE_LENGTH, `Judul minimal ${MIN_TITLE_LENGTH} karakter`)
    .max(200, "Judul maksimal 200 karakter"),
  content: z
    .string()
    .min(MIN_CONTENT_LENGTH, `Konten minimal ${MIN_CONTENT_LENGTH} karakter`),
  content_json: z.any().optional(),
  category_id: z.string().uuid("Kategori harus dipilih").nullable().optional(),
  excerpt: z.string().max(300, "Excerpt maksimal 300 karakter").optional(),
  cover_image_url: z.string().url("URL cover tidak valid").nullable().optional(),
});

export const updateArticleSchema = createArticleSchema.partial();

export const reviewCommentSchema = z.object({
  selected_text: z.string().min(1, "Teks yang di-highlight tidak boleh kosong"),
  comment: z.string().min(1, "Komentar tidak boleh kosong"),
  type: z.enum([
    "LANGUAGE",
    "SPELLING",
    "CONTENT",
    "FACT",
    "SOURCE",
    "STRUCTURE",
    "FORMAT",
    "OTHER",
  ]),
  start_position: z.any(),
  end_position: z.any(),
});

export const requestRevisionSchema = z.object({
  general_comment: z.string().nullable().optional(),
  review_id: z.string().uuid(),
});

export const approveArticleSchema = z.object({
  review_id: z.string().uuid(),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  email: z.string().email("Email tidak valid"),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, "Password saat ini harus diisi"),
  new_password: z
    .string()
    .min(6, "Password baru minimal 6 karakter")
    .max(100, "Password maksimal 100 karakter"),
  confirm_password: z.string().min(1, "Konfirmasi password harus diisi"),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "Nama kategori harus diisi").max(100),
  description: z.string().max(300).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const fileUploadSchema = z.object({
  size: z.number().max(MAX_FILE_SIZE, "File maksimal 5 MB"),
  type: z.string().refine((t) => ALLOWED_IMAGE_MIME.includes(t), {
    message: "Format file harus JPG, PNG, atau WEBP",
  }),
});