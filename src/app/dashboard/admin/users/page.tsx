import { prisma } from "@/lib/prisma";
import { UsersTable } from "./users-table";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar_url: true,
      created_at: true,
    },
  });

  const serializedUsers = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as "ADMIN" | "TEACHER" | "STUDENT",
    avatar_url: u.avatar_url,
    created_at: u.created_at.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kelola Users</h1>
          <p className="text-muted-foreground">
            Kelola semua pengguna platform Blog Santri
          </p>
        </div>
      </div>

      <UsersTable users={serializedUsers} />
    </div>
  );
}