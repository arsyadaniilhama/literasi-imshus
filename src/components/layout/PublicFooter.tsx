import Link from "next/link";
import { BookOpen } from "lucide-react";
import { SCHOOL_NAME, SCHOOL_SHORT } from "@/lib/constants";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/articles", label: "Artikel" },
  { href: "/categories", label: "Kategori" },
  { href: "/tentang", label: "Tentang" },
];

export function PublicFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-primary/10 bg-muted/60">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="font-heading text-base font-semibold text-primary">
                {SCHOOL_NAME}
              </p>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Media literasi santri. Menulis, berbagi, dan menginspirasi.
            </p>
          </div>
          <div className="sm:col-span-1">
            <p className="text-sm font-medium text-foreground">Tautan</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="sm:col-span-1">
            <p className="text-sm font-medium text-foreground">Kontak</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Pesantren IMSHUS Isy Karima</li>
              <li>Karanganyar, Jawa Tengah</li>
              <li>info@imshus.sch.id</li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {SCHOOL_SHORT}. Dibuat dengan ❤️ oleh para santri.
        </p>
      </div>
    </footer>
  );
}
