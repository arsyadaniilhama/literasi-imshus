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
          className="group flex items-center gap-2.5"
          aria-label={`${SCHOOL_NAME} - Beranda`}
        >
          <Image
            src="/imshus-logo.png"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 rounded-lg object-contain shadow-sm transition-transform duration-300 ease-out group-hover:scale-110"
            aria-hidden="true"
          />
          <span className="font-heading text-lg font-semibold tracking-tight text-primary">
            {SCHOOL_NAME}
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-1 sm:flex" aria-label="Navigasi utama">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              style={{ animationDelay: `${i * 60}ms` }}
              className={cn(
                "group relative animate-slide-up-fade px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              {link.label}
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-3 bottom-0.5 h-0.5 origin-left rounded-full bg-gold transition-transform duration-300 ease-out",
                  pathname === link.href
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100"
                )}
              />
            </Link>
          ))}
          <Button asChild size="lg" className="relative ml-2 shrink-0 h-10 overflow-hidden border-2 border-gold/60 bg-gradient-to-r from-primary via-primary to-gold text-base font-semibold tracking-wide text-primary-foreground shadow-[0_8px_30px_rgba(0,0,0,0.25),inset_0_0_0_1px_rgba(255,255,255,0.25)] transition-all duration-300 hover:-translate-y-px hover:shadow-[0_12px_40px_rgba(0,0,0,0.3),inset_0_0_0_1px_rgba(255,255,255,0.35)] hover:border-gold">
            <Link href="/login">
              <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
              Masuk
              <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
                <span className="absolute inset-y-0 left-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition-opacity duration-300 group-hover/button:opacity-100" />
              </span>
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
                  "group relative rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                {link.label}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-3 bottom-1.5 h-0.5 origin-left rounded-full bg-gold transition-transform duration-300 ease-out",
                    pathname === link.href
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  )}
                />
              </Link>
            ))}
            <Button asChild className="relative mt-2 h-10 w-full overflow-hidden border-2 border-gold/60 bg-gradient-to-r from-primary via-primary to-gold text-base font-semibold tracking-wide text-primary-foreground shadow-[0_8px_30px_rgba(0,0,0,0.25),inset_0_0_0_1px_rgba(255,255,255,0.25)] transition-all duration-300 hover:-translate-y-px hover:shadow-[0_12px_40px_rgba(0,0,0,0.3),inset_0_0_0_1px_rgba(255,255,255,0.35)] hover:border-gold">
              <Link href="/login">
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Masuk
                <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
                  <span className="absolute inset-y-0 left-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition-opacity duration-300 group-hover/button:opacity-100" />
                </span>
              </Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
