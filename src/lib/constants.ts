// ============================================================
// Tipe domain & konstanta — Blog Santri IMSHUS Isy Karima
// ============================================================

export type Role = "ADMIN" | "TEACHER" | "STUDENT";

export type ArticleStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "REVISION_REQUIRED"
  | "APPROVED"
  | "PUBLISHED"
  | "ARCHIVED";

export type ReviewCommentType =
  | "LANGUAGE"
  | "SPELLING"
  | "CONTENT"
  | "FACT"
  | "SOURCE"
  | "STRUCTURE"
  | "FORMAT"
  | "OTHER";

export type ReviewCommentStatus = "OPEN" | "RESOLVED";

export type ReviewDecision =
  | "PENDING"
  | "IN_REVIEW"
  | "REVISION_REQUIRED"
  | "APPROVED";

// ---- Label Indonesia ----
export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  TEACHER: "Guru",
  STUDENT: "Santri",
};

export const ARTICLE_STATUS_LABELS: Record<ArticleStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Menunggu Review",
  UNDER_REVIEW: "Sedang Direview",
  REVISION_REQUIRED: "Perlu Revisi",
  APPROVED: "Disetujui",
  PUBLISHED: "Published",
  ARCHIVED: "Diarsipkan",
};

export const REVIEW_COMMENT_TYPE_LABELS: Record<ReviewCommentType, string> = {
  LANGUAGE: "Bahasa",
  SPELLING: "Ejaan",
  CONTENT: "Isi",
  FACT: "Fakta",
  SOURCE: "Sumber",
  STRUCTURE: "Struktur",
  FORMAT: "Format",
  OTHER: "Lainnya",
};

// ---- Warna status (PRD #34) ----
export const ARTICLE_STATUS_COLORS: Record<ArticleStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
  REVISION_REQUIRED: "bg-orange-100 text-orange-700",
  APPROVED: "bg-green-100 text-green-700",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  ARCHIVED: "bg-gray-100 text-gray-500",
};

// ---- Warna highlight review (PRD #10) ----
export const REVIEW_COMMENT_TYPE_COLORS: Record<ReviewCommentType, string> = {
  LANGUAGE: "#3b82f6", // biru
  SPELLING: "#eab308", // kuning
  CONTENT: "#f97316", // oranye
  FACT: "#ef4444", // merah
  SOURCE: "#a855f7", // ungu
  STRUCTURE: "#22c55e", // hijau
  FORMAT: "#6b7280", // abu-abu
  OTHER: "#14b8a6", // teal
};

export const REVIEW_COMMENT_TYPE_LIGHT_BG: Record<ReviewCommentType, string> = {
  LANGUAGE: "bg-blue-100",
  SPELLING: "bg-yellow-100",
  CONTENT: "bg-orange-100",
  FACT: "bg-red-100",
  SOURCE: "bg-purple-100",
  STRUCTURE: "bg-green-100",
  FORMAT: "bg-gray-100",
  OTHER: "bg-teal-100",
};

export const REVIEW_COMMENT_TYPE_DOT: Record<ReviewCommentType, string> = {
  LANGUAGE: "bg-blue-500",
  SPELLING: "bg-yellow-500",
  CONTENT: "bg-orange-500",
  FACT: "bg-red-500",
  SOURCE: "bg-purple-500",
  STRUCTURE: "bg-green-500",
  FORMAT: "bg-gray-500",
  OTHER: "bg-teal-500",
};

export const REVIEW_COMMENT_TYPES: ReviewCommentType[] = [
  "LANGUAGE",
  "SPELLING",
  "CONTENT",
  "FACT",
  "SOURCE",
  "STRUCTURE",
  "FORMAT",
  "OTHER",
];

export const REVIEW_DECISION_LABELS: Record<ReviewDecision, string> = {
  PENDING: "Menunggu",
  IN_REVIEW: "Sedang Direview",
  REVISION_REQUIRED: "Perlu Revisi",
  APPROVED: "Disetujui",
};

// ---- Validasi ----
export const MIN_TITLE_LENGTH = 3;
export const MIN_CONTENT_LENGTH = 20;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_IMAGE_MIME = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// ---- Storage buckets ----
export const STORAGE_BUCKETS = {
  COVERS: "article-covers",
  IMAGES: "article-images",
  AVATARS: "avatars",
} as const;

// ---- Notifications ----
export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  ARTICLE_SUBMITTED: "Artikel dikirim untuk review",
  REVIEW_STARTED: "Review dimulai",
  REVISION_REQUIRED: "Artikel perlu direvisi",
  ARTICLE_APPROVED: "Artikel disetujui",
  ARTICLE_PUBLISHED: "Artikel dipublikasikan",
};

// ---- Nama sekolah ----
export const SCHOOL_NAME = "IMSHUS Isy Karima";
export const SCHOOL_SHORT = "Blog Santri IMSHUS Isy Karima";

// ---- URL situs (untuk SEO: canonical, sitemap, robots) ----
// Di production selalu pakai URL publik. Di lokal pakai env (bisa override untuk staging).
export const SITE_URL =
  process.env.NODE_ENV === "production"
    ? "https://blog-santri.vercel.app"
    : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");
