import { requireStudent } from "@/lib/auth/session";
import { ProfileClient } from "./ProfileClient";

export const dynamic = "force-dynamic";

export default async function StudentProfilePage() {
  const user = await requireStudent();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Profil</h1>
        <p className="text-muted-foreground">
          Kelola data diri dan keamanan akun Anda
        </p>
      </div>

      <ProfileClient
        user={{
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
        }}
      />
    </div>
  );
}
