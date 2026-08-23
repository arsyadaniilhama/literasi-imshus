-- ============================================================
-- Blog Santri IMSHUS Isy Karima — Database Schema (PostgreSQL)
-- Jalankan di Supabase SQL Editor (Project → SQL Editor → New query)
-- ============================================================

-- ---------- ENUMS ----------
create type "Role" as enum ('ADMIN', 'TEACHER', 'STUDENT');
create type "ArticleStatus" as enum ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUIRED', 'APPROVED', 'PUBLISHED', 'ARCHIVED');
create type "ReviewDecision" as enum ('PENDING', 'IN_REVIEW', 'REVISION_REQUIRED', 'APPROVED');
create type "ReviewCommentType" as enum ('LANGUAGE', 'SPELLING', 'CONTENT', 'FACT', 'SOURCE', 'STRUCTURE', 'FORMAT', 'OTHER');
create type "ReviewCommentStatus" as enum ('OPEN', 'RESOLVED');

-- ---------- TABLES ----------
create table "users" (
  "id" uuid primary key,
  "name" text not null,
  "email" text not null unique,
  "avatar_url" text,
  "role" "Role" not null default 'STUDENT',
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);

create table "categories" (
  "id" uuid primary key default gen_random_uuid(),
  "name" text not null unique,
  "slug" text not null unique,
  "description" text,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);

create table "articles" (
  "id" uuid primary key default gen_random_uuid(),
  "author_id" uuid not null references "users"("id"),
  "category_id" uuid references "categories"("id"),
  "title" text not null,
  "slug" text unique,
  "excerpt" text,
  "cover_image_url" text,
  "status" "ArticleStatus" not null default 'DRAFT',
  "current_revision_id" uuid,
  "published_at" timestamptz,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);

create table "article_revisions" (
  "id" uuid primary key default gen_random_uuid(),
  "article_id" uuid not null references "articles"("id") on delete cascade,
  "revision_number" int not null,
  "title" text not null,
  "excerpt" text,
  "content" text not null,
  "content_json" jsonb not null default '{}'::jsonb,
  "cover_image_url" text,
  "created_by" uuid not null references "users"("id"),
  "created_at" timestamptz not null default now(),
  unique ("article_id", "revision_number")
);

-- FK: articles.current_revision_id -> article_revisions (setelah tabel revisi dibuat)
alter table "articles" add constraint "articles_current_revision_id_fkey"
  foreign key ("current_revision_id") references "article_revisions"("id");
create unique index "articles_current_revision_id_key" on "articles" ("current_revision_id") where "current_revision_id" is not null;

create table "reviews" (
  "id" uuid primary key default gen_random_uuid(),
  "article_id" uuid not null references "articles"("id") on delete cascade,
  "revision_id" uuid not null references "article_revisions"("id") on delete cascade,
  "reviewer_id" uuid references "users"("id"),
  "decision" "ReviewDecision" not null default 'PENDING',
  "general_comment" text,
  "created_at" timestamptz not null default now(),
  "completed_at" timestamptz
);

create table "review_comments" (
  "id" uuid primary key default gen_random_uuid(),
  "review_id" uuid not null references "reviews"("id") on delete cascade,
  "article_id" uuid not null references "articles"("id") on delete cascade,
  "revision_id" uuid not null references "article_revisions"("id") on delete cascade,
  "reviewer_id" uuid not null references "users"("id"),
  "selected_text" text not null,
  "comment" text not null,
  "type" "ReviewCommentType" not null default 'OTHER',
  "start_position" jsonb not null default '{}'::jsonb,
  "end_position" jsonb not null default '{}'::jsonb,
  "status" "ReviewCommentStatus" not null default 'OPEN',
  "created_at" timestamptz not null default now(),
  "resolved_at" timestamptz
);

create table "notifications" (
  "id" uuid primary key default gen_random_uuid(),
  "user_id" uuid not null references "users"("id") on delete cascade,
  "type" text not null,
  "title" text not null,
  "message" text not null,
  "article_id" uuid references "articles"("id") on delete cascade,
  "is_read" boolean not null default false,
  "created_at" timestamptz not null default now()
);

create table "audit_logs" (
  "id" uuid primary key default gen_random_uuid(),
  "user_id" uuid not null references "users"("id") on delete cascade,
  "action" text not null,
  "entity_type" text not null,
  "entity_id" text not null,
  "metadata" jsonb,
  "created_at" timestamptz not null default now()
);

-- ---------- INDEXES ----------
create index "articles_author_id_idx" on "articles" ("author_id");
create index "articles_status_idx" on "articles" ("status");
create index "articles_category_id_idx" on "articles" ("category_id");
create index "reviews_article_id_idx" on "reviews" ("article_id");
create index "reviews_decision_idx" on "reviews" ("decision");
create index "review_comments_article_id_idx" on "review_comments" ("article_id");
create index "review_comments_review_id_idx" on "review_comments" ("review_id");
create index "notifications_user_id_idx" on "notifications" ("user_id");
create index "audit_logs_created_at_idx" on "audit_logs" ("created_at");

-- ---------- TRIGGER: updated_at ----------
create or replace function "set_updated_at"()
returns trigger as $$
begin
  NEW."updated_at" = now();
  return NEW;
end;
$$ language plpgsql;

create trigger "set_updated_at_users" before update on "users"
  for each row execute procedure "set_updated_at"();
create trigger "set_updated_at_articles" before update on "articles"
  for each row execute procedure "set_updated_at"();
create trigger "set_updated_at_categories" before update on "categories"
  for each row execute procedure "set_updated_at"();

-- ---------- RLS (Row Level Security) ----------
alter table "users" enable row level security;
alter table "articles" enable row level security;
alter table "article_revisions" enable row level security;
alter table "reviews" enable row level security;
alter table "review_comments" enable row level security;
alter table "categories" enable row level security;
alter table "notifications" enable row level security;
alter table "audit_logs" enable row level security;

-- users: bisa lihat profil sendiri, admin semua
create policy "users_select_own" on "users"
  for select using (auth.uid() = id or exists (select 1 from "users" u where u.id = auth.uid() and u."role" = 'ADMIN'));
create policy "users_update_own" on "users"
  for update using (auth.uid() = id);

-- categories: public read
create policy "categories_read" on "categories"
  for select using (true);
create policy "categories_admin_all" on "categories"
  for all using (exists (select 1 from "users" u where u.id = auth.uid() and u."role" = 'ADMIN'));

-- articles: student hanya milik sendiri, teacher/admin semua
create policy "articles_select" on "articles"
  for select using (
    (exists (select 1 from "users" u where u.id = auth.uid() and u."role" in ('TEACHER', 'ADMIN')))
    or "author_id" = auth.uid()
    or "status" = 'PUBLISHED'
  );
create policy "articles_insert_own" on "articles"
  for insert with check ("author_id" = auth.uid());
create policy "articles_update_own" on "articles"
  for update using ("author_id" = auth.uid() or exists (select 1 from "users" u where u.id = auth.uid() and u."role" in ('TEACHER', 'ADMIN')));
create policy "articles_delete_own" on "articles"
  for delete using ("author_id" = auth.uid() or exists (select 1 from "users" u where u.id = auth.uid() and u."role" in ('TEACHER', 'ADMIN')));

-- article_revisions: mengikuti akses artikel
create policy "revisions_select" on "article_revisions"
  for select using (
    exists (select 1 from "articles" a where a.id = "article_id" and (a."author_id" = auth.uid() or a."status" = 'PUBLISHED'))
    or exists (select 1 from "users" u where u.id = auth.uid() and u."role" in ('TEACHER', 'ADMIN'))
  );

-- reviews & comments: student melihat milik artikelnya, teacher/admin semua
create policy "reviews_select" on "reviews"
  for select using (
    exists (select 1 from "articles" a where a.id = "article_id" and a."author_id" = auth.uid())
    or exists (select 1 from "users" u where u.id = auth.uid() and u."role" in ('TEACHER', 'ADMIN'))
  );

create policy "comments_select" on "review_comments"
  for select using (
    exists (select 1 from "articles" a where a.id = "article_id" and a."author_id" = auth.uid())
    or exists (select 1 from "users" u where u.id = auth.uid() and u."role" in ('TEACHER', 'ADMIN'))
  );

-- notifications: hanya milik sendiri
create policy "notifications_select_own" on "notifications"
  for select using ("user_id" = auth.uid());
create policy "notifications_update_own" on "notifications"
  for update using ("user_id" = auth.uid());

-- ============================================================
-- SEED DATA — kategori awal
-- ============================================================
insert into "categories" ("name", "slug", "description") values
  ('Adab', 'adab', 'Tulisan tentang adab dan akhlak'),
  ('Keagamaan', 'keagamaan', 'Tulisan tentang ilmu agama'),
  ('Kisah & Pengalaman', 'kisah-pengalaman', 'Pengalaman santri di pesantren'),
  ('Cerita Pendek', 'cerpen', 'Karya fiksi santri'),
  ('Puisi', 'puisi', 'Karya puisi santri'),
  ('Ilmu Pengetahuan', 'ilmu-pengetahuan', 'Tulisan populer tentang ilmu'),
on conflict (name) do nothing;
