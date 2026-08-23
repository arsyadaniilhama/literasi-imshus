import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";
import { id } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format timestamp menjadi "10 menit yang lalu" (Bahasa Indonesia) */
export function timeAgo(date: string | Date | null): string {
  if (!date) return "-";
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: id,
  });
}

/** Format tanggal penuh Bahasa Indonesia, mis. "23 Agustus 2026" */
export function formatDate(
  date: string | Date | null,
  pattern = "d MMMM yyyy"
): string {
  if (!date) return "-";
  return format(new Date(date), pattern, { locale: id });
}

/** Slugify: "Adab Menuntut Ilmu" → "adab-menuntut-ilmu" */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Generate ID sederhana untuk posisi highlight */
export function generateId(prefix = "c"): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${rand}`;
}

/** Hapus tag HTML untuk mengubah rich text menjadi teks polos */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Hitung jumlah kata dari rich text */
export function countWords(html: string): number {
  const text = htmlToPlainText(html);
  return text ? text.split(" ").filter(Boolean).length : 0;
}
