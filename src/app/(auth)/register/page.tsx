import { redirect } from "next/navigation";

// ============================================================
// Pendaftaran publik DINONAKTIFKAN — akun hanya dibuat oleh admin
// (dashboard admin → Kelola Users → Tambah User).
// Route ini tetap ada agar URL lama tidak 404, langsung redirect ke login.
// ============================================================

export default function RegisterPage() {
  redirect("/login");
}
