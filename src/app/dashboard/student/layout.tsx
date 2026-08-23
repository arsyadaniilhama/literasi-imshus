import { requireStudent } from "@/lib/auth/session";
import { StudentSidebar } from "@/components/dashboard/StudentSidebar";

export default async function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireStudent();

  return (
    <div className="min-h-screen bg-background lg:flex [font-family:var(--font-geist-sans),sans-serif]">
      <StudentSidebar userName={user.name} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-primary/10 bg-background/95 pl-14 pr-4 backdrop-blur-sm lg:px-6">
          <h1 className="font-heading text-lg font-semibold">Dasbor Santri</h1>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary sm:inline-block">
              {user.name}
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}