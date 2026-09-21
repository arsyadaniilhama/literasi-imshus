import type { Metadata } from "next";
import { LayoutDashboard, FileText, PenTool, User } from "lucide-react";
import { requireStudent } from "@/lib/auth/session";
import {
  DashboardSidebar,
  type DashboardNavItem,
} from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

const NAV_ITEMS: DashboardNavItem[] = [
  { href: "/dashboard/student", label: "Dasbor", icon: LayoutDashboard },
  { href: "/dashboard/student/articles", label: "Artikel Saya", icon: FileText },
  { href: "/dashboard/student/articles/new", label: "Buat Artikel", icon: PenTool },
  { href: "/dashboard/student/profile", label: "Profil", icon: User },
];

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireStudent();

  return (
    <div className="flex min-h-screen bg-muted/30 [font-family:var(--font-geist-sans),sans-serif]">
      <DashboardSidebar
        items={NAV_ITEMS}
        userName={user.name}
        userRole="Santri"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader title="Dasbor Santri" userName={user.name} />
        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
