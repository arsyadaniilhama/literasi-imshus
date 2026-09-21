import type { Metadata } from "next";
import { requireTeacher } from "@/lib/auth/session";
import {
  DashboardSidebar,
  type DashboardNavItem,
} from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

const NAV_ITEMS: DashboardNavItem[] = [
  { href: "/dashboard/teacher", label: "Dasbor", icon: "layoutDashboard" },
  {
    href: "/dashboard/teacher",
    label: "Artikel Masuk",
    icon: "inbox",
    tab: "submitted",
  },
  {
    href: "/dashboard/teacher",
    label: "Sedang Direview",
    icon: "eye",
    tab: "reviewing",
  },
  {
    href: "/dashboard/teacher",
    label: "Riwayat",
    icon: "history",
    tab: "history",
  },
];

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireTeacher();

  return (
    <div className="flex min-h-screen bg-muted/30 [font-family:var(--font-geist-sans),sans-serif]">
      <DashboardSidebar
        items={NAV_ITEMS}
        userName={user.name}
        userRole="Guru"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader title="Dasbor Guru" userName={user.name} />
        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
