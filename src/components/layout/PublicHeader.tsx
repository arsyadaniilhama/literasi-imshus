"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { SCHOOL_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/articles", label: "Artikel" },
  { href: "/categories", label: "Kategori" },
  { href: "/tentang", label: "Tentang" },
];

export function PublicHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);

  // Tutup menu saat pindah halaman
  React.useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label={`${SCHOOL_NAME} - Beranda`}
        >
          <Image
            src="/imshus-logo.png"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 rounded-lg object-contain shadow-sm"
            aria-hidden="true"
          />
          <span className="font-heading text-lg font-semibold tracking-tight text-primary">
            {SCHOOL_NAME}
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-1 sm:flex" aria-label="Navigasi utama">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Button asChild variant="outline" size="sm" className="ml-2">
            <Link href="/login">
              <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
              Masuk
            </Link>
          </Button>
        </nav>

        {/* Tombol hamburger mobile */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Panel menu mobile */}
      {menuOpen && (
        <nav
          className="border-t border-border bg-background px-4 py-3 sm:hidden"
          aria-label="Navigasi utama"
        >
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Button asChild className="mt-2 w-full">
              <Link href="/login">
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Masuk
              </Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
