import type { Metadata } from "next";
import { requireTeacher } from "@/lib/auth/session";
import { TeacherSidebar } from "@/components/dashboard/TeacherSidebar";

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
    <div className="min-h-screen bg-background flex [font-family:var(--font-geist-sans),sans-serif]">
      <TeacherSidebar userName={user.name} userRole="Guru" />
      <main className="flex-1 lg:ml-64 min-w-0">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-primary/10">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <h1 className="font-heading text-xl font-semibold">Dasbor Guru</h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                {user.name}
              </span>
            </div>
          </div>
        </header>
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}