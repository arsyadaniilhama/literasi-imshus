"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  PenTool,
  User,
  X,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/actions/auth";

const navigation = [
  { name: "Dasbor", href: "/dashboard/student", icon: LayoutDashboard },
  { name: "Artikel Saya", href: "/dashboard/student/articles", icon: FileText },
  { name: "Buat Artikel", href: "/dashboard/student/articles/new", icon: PenTool },
  { name: "Profil", href: "/dashboard/student/profile", icon: User },
] as const;

interface StudentSidebarProps {
  userName: string;
}

export function StudentSidebar({ userName }: StudentSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Mobile hamburger button */}
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

      {/* Mobile overlay */}
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
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-primary/10 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <PenTool className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <span className="block font-heading text-base font-semibold">
                Blog Santri
              </span>
              <span className="block text-xs text-muted-foreground">
                Panel Santri
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
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
          aria-label="Menu navigasi"
        >
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/dashboard/student/articles" &&
                pathname.startsWith("/dashboard/student/articles/") &&
                pathname !== "/dashboard/student/articles/new") ||
              (item.href === "/dashboard/student/articles/new" &&
                pathname.startsWith("/dashboard/student/articles/new"));

            return (
              <Link
                key={item.name}
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
                <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer user + logout */}
        <div className="space-y-2 border-t border-primary/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">Santri</p>
            </div>
          </div>
          <form action={logout}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Keluar
            </Button>
          </form>
        </div>
      </aside>
    </>
  );
}