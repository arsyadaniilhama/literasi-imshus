# Setup Supabase — Blog Santri IMSHUS Isy Karima

Panduan ini untuk menghubungkan aplikasi ke Supabase (database PostgreSQL, auth, dan storage).

---

## 1. Buat Proyek Supabase

1. Buka [supabase.com](https://supabase.com) dan login.
2. Klik **New Project**.
3. Isi nama proyek (mis. `blog-santri-ims-hus`), password database, dan region (pilih yang dekat, mis. Singapore `ap-southeast-1`).
4. Tunggu hingga proyek selesai dibuat.

## 2. Jalankan Schema Database

1. Buka **SQL Editor** di dashboard Supabase.
2. Salin seluruh isi file `supabase/schema.sql` dari proyek ini.
3. Klik **Run**.
4. Pastikan tidak ada error — semua tabel, enum, index, RLS policy, trigger, dan seed kategori akan dibuat.

## 3. Ambil Kredensial

### Project URL & Anon Key
- **Settings → API** (di sidebar kiri)
- Salin:
  - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Service Role Key
- **Settings → API** → bagian **Service Role**
- ⚠️ Hanya untuk server-side (server actions). Jangan pernah bocorkan ke browser.
  - → `SUPABASE_SERVICE_ROLE_KEY`

### Database Connection String
- **Project Settings → Database → Connection string → URI**
- Gunakan koneksi **direct** atau **pooler** (dengan password yang benar).
  - → `DATABASE_URL`

## 4. Isi Environment Variables

Salin `.env.example` menjadi `.env.local` di root proyek, lalu isi nilainya:

```bash
cp .env.example .env.local
```

```ini
# --- Supabase (Settings → API) ---
NEXT_PUBLIC_SUPABASE_URL="https://YOUR-PROJECT-REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# --- PostgreSQL (Project Settings → Database → Connection string) ---
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.YOUR-PROJECT-REF.supabase.co:5432/postgres"

# --- App ---
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 5. Buat Storage Buckets (untuk upload gambar)

Di dashboard Supabase: **Storage → New bucket**, buat 3 bucket:

| Nama | Access | Keterangan |
|------|--------|------------|
| `article-covers` | Public | Gambar cover artikel |
| `article-images` | Public | Gambar di dalam artikel |
| `avatars` | Public | Foto profil |

## 6. Buat User Awal (Admin)

Karena registrasi publik default ke role `STUDENT`, buat admin pertama via SQL Editor:

```sql
-- 1. Buat user di Supabase Auth terlebih dahulu (Authentication → Add user)
-- 2. Lalu isi baris users-nya di SQL Editor:
insert into "users" ("id", "name", "email", "role")
values (
  'PILIH_USER_ID_DARI_AUTH',
  'Nama Admin',
  'email-admin@example.com',
  'ADMIN'
);
```

> Setelah ada admin, semua role lain bisa dibuat dari **Dashboard Admin → Users**.
> Santri/guru tetap bisa daftar lewat `/register` (default role STUDENT), lalu diubah role-nya oleh admin.

## 7. Jalankan Aplikasi

```bash
pnpm install
pnpm dev
```

Buka `http://localhost:3000`.

---

## Troubleshooting

- **`prisma generate` error koneksi** → pastikan `DATABASE_URL` sudah benar dan proyek Supabase sudah aktif.
- **Auth login gagal** → pastikan user ada di tabel `users` (bukan hanya di Supabase Auth). Registrasi otomatis membuat baris, tapi user yang dibuat manual di Authentication perlu baris `users` juga.
- **Gambar tidak muncul** → pastikan bucket sudah dibuat dan `NEXT_PUBLIC_APP_URL` benar.
- **RLS "row-level security" error** → pastikan service role dipakai untuk operasi server (server actions), dan anon key hanya untuk client.
