"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/articles", label: "Artikel" },
  { href: "/categories", label: "Kategori" },
  { href: "/tentang", label: "Tentang" },
];

function NavUnderline({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute inset-x-3 bottom-0.5 h-0.5 origin-left rounded-full bg-gold transition-transform duration-300 ease-out",
        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
      )}
    />
  );
}

export function PublicNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const close = () => setMenuOpen(false);

  return (
    <>
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
            <NavUnderline active={pathname === link.href} />
          </Link>
        ))}
        <Button asChild size="lg" className="group relative ml-2 h-10 shrink-0 overflow-hidden border-2 border-gold/60 bg-gradient-to-r from-primary via-primary to-gold text-base font-semibold tracking-wide text-primary-foreground shadow-[0_8px_30px_rgba(0,0,0,0.25),inset_0_0_0_1px_rgba(255,255,255,0.25)] transition-all duration-300 hover:-translate-y-px hover:border-gold hover:shadow-[0_12px_40px_rgba(0,0,0,0.3),inset_0_0_0_1px_rgba(255,255,255,0.35)]">
          <Link href="/login">
            <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
            Masuk
            <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
              <span className="absolute inset-y-0 left-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
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

      {/* Panel menu mobile */}
      {menuOpen && (
        <nav
          className="basis-full border-t border-border bg-background px-4 py-3 sm:hidden"
          aria-label="Navigasi utama"
        >
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className={cn(
                  "group relative rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                {link.label}
                <NavUnderline active={pathname === link.href} />
              </Link>
            ))}
            <Button asChild onClick={close} className="group relative mt-2 h-10 w-full overflow-hidden border-2 border-gold/60 bg-gradient-to-r from-primary via-primary to-gold text-base font-semibold tracking-wide text-primary-foreground shadow-[0_8px_30px_rgba(0,0,0,0.25),inset_0_0_0_1px_rgba(255,255,255,0.25)] transition-all duration-300 hover:-translate-y-px hover:border-gold hover:shadow-[0_12px_40px_rgba(0,0,0,0.3),inset_0_0_0_1px_rgba(255,255,255,0.35)]">
              <Link href="/login">
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Masuk
                <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
                  <span className="absolute inset-y-0 left-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </span>
              </Link>
            </Button>
          </div>
        </nav>
      )}
    </>
  );
}
