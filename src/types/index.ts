// ============================================================
// Tipe data — Blog Santri
// ============================================================
export type {
  Role,
  ArticleStatus,
  ReviewCommentType,
  ReviewCommentStatus,
  ReviewDecision,
} from "@/lib/constants";

import type {
  Role,
  ArticleStatus,
  ReviewCommentType,
  ReviewCommentStatus,
  ReviewDecision,
} from "@/lib/constants";

// ---- User ----
export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  role: Role;
  created_at: string;
  updated_at: string;
}

// ---- Category ----
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Article ----
export interface Article {
  id: string;
  author_id: string;
  category_id: string | null;
  title: string;
  slug: string | null;
  excerpt: string | null;
  cover_image_url: string | null;
  status: ArticleStatus;
  current_revision_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations (populated by query)
  author?: Pick<User, "id" | "name" | "avatar_url">;
  category?: Pick<Category, "id" | "name" | "slug"> | null;
  current_revision?: ArticleRevision | null;
}

// ---- Article Revision ----
export interface ArticleRevision {
  id: string;
  article_id: string;
  revision_number: number;
  title: string;
  excerpt: string | null;
  content: string; // HTML
  content_json: unknown; // Tiptap JSON
  cover_image_url: string | null;
  created_by: string;
  created_at: string;
}

// ---- Review ----
export interface Review {
  id: string;
  article_id: string;
  revision_id: string;
  reviewer_id: string;
  decision: ReviewDecision;
  general_comment: string | null;
  created_at: string;
  completed_at: string | null;
  // Relations
  reviewer?: Pick<User, "id" | "name" | "avatar_url">;
  comments?: ReviewComment[];
}

// ---- Review Comment ----
export interface ReviewComment {
  id: string;
  review_id: string;
  article_id: string;
  revision_id: string;
  reviewer_id: string;
  selected_text: string;
  comment: string;
  type: ReviewCommentType;
  start_position: unknown; // JSON path/offset
  end_position: unknown;
  status: ReviewCommentStatus;
  created_at: string;
  resolved_at: string | null;
}

// ---- Notification ----
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  article_id: string | null;
  is_read: boolean;
  created_at: string;
}

// ---- Audit Log ----
export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ---- Dashboard Stats ----
export interface StudentDashboardStats {
  total: number;
  draft: number;
  submitted: number;
  under_review: number;
  revision_required: number;
  approved: number;
  published: number;
}

export interface TeacherDashboardStats {
  pending_review: number;
  in_review: number;
  revision_required: number;
  approved_today: number;
}

// ---- Server Action Results ----
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}