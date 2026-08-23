"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Inbox,
  Eye,
  History,
  GraduationCap,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dasbor", href: "/dashboard/teacher", icon: LayoutDashboard, tab: null },
  { name: "Artikel Masuk", href: "/dashboard/teacher?tab=submitted", icon: Inbox, tab: "submitted" },
  { name: "Sedang Direview", href: "/dashboard/teacher?tab=reviewing", icon: Eye, tab: "reviewing" },
  { name: "Riwayat", href: "/dashboard/teacher?tab=history", icon: History, tab: "history" },
] as const;

interface TeacherSidebarProps {
  userName: string;
  userRole: string;
}

export function TeacherSidebar({ userName, userRole }: TeacherSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isActive = (item: (typeof navigation)[number]) => {
    if (pathname !== "/dashboard/teacher") return false;
    if (item.tab === null) return currentTab === null || currentTab === "";
    return currentTab === item.tab;
  };

  return (
    <>
      {/* Tombol hamburger mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm"
        onClick={() => setIsMobileMenuOpen(true)}
        aria-label="Buka menu navigasi"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Overlay mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 transform bg-card border-r border-primary/10 transition-transform duration-200 ease-in-out",
          "flex flex-col",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        aria-label="Navigasi utama guru"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-primary/10">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-heading font-semibold text-lg">Blog Santri</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Tutup menu navigasi"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Info user */}
          <div className="px-4 py-4 border-b border-primary/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{userName}</p>
                <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
              </div>
            </div>
          </div>

          {/* Navigasi */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Menu navigasi">
            {navigation.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-primary/10">
            <form action="/api/auth/logout" method="POST">
              <Button
                type="submit"
                variant="outline"
                className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:border-destructive/50"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
                <span>Keluar</span>
              </Button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}