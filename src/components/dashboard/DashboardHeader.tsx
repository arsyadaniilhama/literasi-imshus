interface DashboardHeaderProps {
  title: string;
  userName?: string;
}

/**
 * Header sticky bersama untuk semua peran (Admin, Guru, Santri).
 * `pl-14` memberi ruang untuk hamburger fixed di mobile; `lg:px-6` untuk desktop.
 */
export function DashboardHeader({ title, userName }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-primary/10 bg-background/95 pl-14 pr-4 backdrop-blur-sm lg:px-6">
      <div className="flex items-center gap-4">
        <h1 className="font-heading text-lg font-semibold">{title}</h1>
      </div>
      {userName && (
        <div className="flex items-center gap-3">
          <span className="hidden rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary sm:inline-block">
            {userName}
          </span>
        </div>
      )}
    </header>
  );
}
