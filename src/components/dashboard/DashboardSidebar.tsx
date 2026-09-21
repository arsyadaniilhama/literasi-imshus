"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ScrollText, LogOut, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logout } from "@/actions/auth";

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Opsional: cocokkan juga dengan query-tab (mis. ?tab=submitted) */
  tab?: string;
}

interface DashboardSidebarProps {
  items: DashboardNavItem[];
  userName: string;
  userRole: string;
}

/**
 * Shell sidebar bersama untuk semua peran (Admin, Guru, Santri).
 * Drawer mobile (`fixed` + hamburger) dan persistent di desktop (`lg:static`).
 * Branding, active state, dan footer user/logout identik untuk setiap peran.
 */
export function DashboardSidebar({
  items,
  userName,
  userRole,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = React.useState(false);

  const isItemActive = (item: DashboardNavItem) => {
    // Nav berbasis tab (beberapa item berbagi pathname, dibedakan via ?tab=)
    if (item.tab) {
      return (
        pathname.startsWith(item.href) &&
        searchParams.get("tab") === item.tab
      );
    }
    // Item root tanpa tab: aktif hanya bila tidak ada tab lain yang dipilih
    if (pathname === item.href) {
      return !searchParams.get("tab");
    }
    return pathname.startsWith(item.href + "/");
  };

  return (
    <>
      {/* Hamburger — mobile only */}
      <button
        type="button"
        className="fixed left-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-card text-foreground shadow-md ring-1 ring-border lg:hidden"
        onClick={() => setIsOpen(true)}
        aria-label="Buka menu navigasi"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      </button>

      {/* Overlay — mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "flex h-full w-64 shrink-0 flex-col border-r border-primary/10 bg-card",
          "fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Navigasi utama"
      >
        {/* Branding — identik untuk semua peran */}
        <div className="flex h-16 items-center justify-between border-b border-primary/10 px-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ScrollText className="size-5" aria-hidden="true" />
            </div>
            <div className="leading-tight">
              <span className="block font-heading text-base font-semibold">
                Blog Santri
              </span>
              <span className="block text-xs capitalize text-muted-foreground">
                {userRole}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsOpen(false)}
            aria-label="Tutup menu navigasi"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
          aria-label="Menu navigasi"
        >
          {items.map((item) => {
            const isActive = isItemActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href + (item.tab ?? "")}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => setIsOpen(false)}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="space-y-2 border-t border-primary/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{userName}</p>
              <p className="text-xs capitalize text-muted-foreground">
                {userRole}
              </p>
            </div>
          </div>
          <form action={logout}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Keluar
            </Button>
          </form>
        </div>
      </aside>
    </>
  );
}
