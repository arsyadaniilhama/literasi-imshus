import Link from "next/link";
import { ScrollText, LogOut } from "lucide-react";
import { requireAdmin, roleLabel } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { logout } from "@/actions/auth";
import { AdminNav, MobileNav } from "./nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar — desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-primary/10 bg-card lg:flex">
        <div className="flex h-14 items-center gap-2 border-b border-primary/10 px-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ScrollText className="size-4" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Admin Panel</p>
            <p className="text-xs text-muted-foreground">Blog Santri</p>
          </div>
        </div>

        <AdminNav />

        <div className="mt-auto border-t border-primary/10 p-3">
          <div className="flex items-center gap-2.5 px-1 py-1">
            <Avatar size="sm">
              {admin.avatar_url ? (
                <AvatarImage src={admin.avatar_url} alt={admin.name} />
              ) : null}
              <AvatarFallback>{admin.name?.charAt(0) ?? "A"}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-medium">{admin.name}</p>
              <p className="text-xs text-muted-foreground">{roleLabel(admin.role)}</p>
            </div>
            <form action={logout}>
              <Button type="submit" variant="ghost" size="icon-sm" title="Keluar">
                <LogOut className="size-4" />
                <span className="sr-only">Keluar</span>
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur lg:hidden">
          <Link href="/dashboard/admin" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ScrollText className="size-4" />
            </div>
            <span className="text-sm font-semibold">Admin Panel</span>
          </Link>
          <div className="flex items-center gap-1">
            <Avatar size="sm">
              {admin.avatar_url ? (
                <AvatarImage src={admin.avatar_url} alt={admin.name} />
              ) : null}
              <AvatarFallback>{admin.name?.charAt(0) ?? "A"}</AvatarFallback>
            </Avatar>
            <form action={logout}>
              <Button type="submit" variant="ghost" size="icon-sm" title="Keluar">
                <LogOut className="size-4" />
                <span className="sr-only">Keluar</span>
              </Button>
            </form>
          </div>
        </header>

        {/* Mobile nav */}
        <MobileNav />

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}