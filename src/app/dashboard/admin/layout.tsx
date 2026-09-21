import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import {
  DashboardSidebar,
  type DashboardNavItem,
} from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

const NAV_ITEMS: DashboardNavItem[] = [
  { href: "/dashboard/admin", label: "Dasbor", icon: "layoutDashboard" },
  { href: "/dashboard/admin/users", label: "Pengguna", icon: "users" },
  { href: "/dashboard/admin/articles", label: "Artikel", icon: "fileText" },
  { href: "/dashboard/admin/categories", label: "Kategori", icon: "folderTree" },
  { href: "/dashboard/admin/reviews", label: "Ulasan", icon: "messageSquareText" },
  { href: "/dashboard/admin/activity", label: "Log Aktivitas", icon: "scrollText" },
  { href: "/dashboard/admin/settings", label: "Pengaturan", icon: "settings" },
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
          <div className="mx-auto w-full max-w-7xl xl:max-w-[1440px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
