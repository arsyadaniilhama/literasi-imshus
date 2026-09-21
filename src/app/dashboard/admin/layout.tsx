import type { Metadata } from "next";
import {
  LayoutDashboard,
  Users,
  FileText,
  FolderTree,
  MessageSquareText,
  ScrollText,
  Settings,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import {
  DashboardSidebar,
  type DashboardNavItem,
} from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

const NAV_ITEMS: DashboardNavItem[] = [
  { href: "/dashboard/admin", label: "Dasbor", icon: LayoutDashboard },
  { href: "/dashboard/admin/users", label: "Pengguna", icon: Users },
  { href: "/dashboard/admin/articles", label: "Artikel", icon: FileText },
  { href: "/dashboard/admin/categories", label: "Kategori", icon: FolderTree },
  { href: "/dashboard/admin/reviews", label: "Ulasan", icon: MessageSquareText },
  { href: "/dashboard/admin/activity", label: "Log Aktivitas", icon: ScrollText },
  { href: "/dashboard/admin/settings", label: "Pengaturan", icon: Settings },
];

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-muted/30 [font-family:var(--font-geist-sans),sans-serif]">
      <DashboardSidebar
        items={NAV_ITEMS}
        userName={admin.name}
        userRole="Admin"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader title="Dasbor Admin" userName={admin.name} />
        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
