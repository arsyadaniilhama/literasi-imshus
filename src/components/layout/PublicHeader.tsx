import Link from "next/link";
import Image from "next/image";
import { SCHOOL_NAME } from "@/lib/constants";
import { PublicNav } from "./PublicNav";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between px-4 sm:flex-nowrap sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 py-2"
          aria-label={`${SCHOOL_NAME} - Beranda`}
        >
          <Image
            src="/imshus-logo.png"
            alt=""
            width={36}
            height={36}
            priority
            className="h-9 w-9 rounded-lg object-contain shadow-sm transition-transform duration-300 ease-out group-hover:scale-110"
            aria-hidden="true"
          />
          <span className="font-heading text-lg font-semibold tracking-tight text-primary">
            {SCHOOL_NAME}
          </span>
        </Link>

        <PublicNav />
      </div>
    </header>
  );
}
