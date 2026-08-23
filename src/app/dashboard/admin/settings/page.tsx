import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SCHOOL_NAME } from "@/lib/constants";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Pengaturan platform Blog Santri
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Platform</CardTitle>
          <CardDescription>Informasi umum tentang platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Nama Sekolah</span>
              <span className="font-medium">{SCHOOL_NAME}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Nama Platform</span>
              <span className="font-medium">Blog Santri IMSHUS Isy Karima</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Versi</span>
              <span className="font-medium">0.1.0</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Panduan Penggunaan</CardTitle>
          <CardDescription>Fitur-fitur panel admin</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-4 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Users</strong> — Kelola akun
              pengguna, ubah role, atau hapus user.
            </li>
            <li>
              <strong className="text-foreground">Articles</strong> — Kelola
              semua artikel, ubah status, kategori, arsipkan, atau hapus.
            </li>
            <li>
              <strong className="text-foreground">Categories</strong> — Tambah,
              ubah, dan hapus kategori artikel.
            </li>
            <li>
              <strong className="text-foreground">Reviews</strong> — Pantau
              aktivitas review dari para guru.
            </li>
            <li>
              <strong className="text-foreground">Activity Log</strong> —
              Catatan audit seluruh aktivitas di platform.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
