import { cn } from "@/lib/utils";

/**
 * Pola geometris Islami dekoratif (8-pointed star / girih tile).
 * Murni dekoratif — dipakai sebagai overlay background di hero,
 * halaman auth, dan footer. Tidak butuh asset gambar.
 */
export function IslamicPattern({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full text-primary",
        className
      )}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern
          id="islamic-8star"
          width="56"
          height="56"
          patternUnits="userSpaceOnUse"
        >
          {/* Grid persegi */}
          <path
            d="M 0 0 L 56 0 M 0 28 L 56 28 M 28 0 L 28 56"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.35"
          />
          {/* Bintang 8 sudut (khatam) */}
          <path
            d="M 28 6 L 33 23 L 50 28 L 33 33 L 28 50 L 23 33 L 6 28 L 23 23 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.5"
          />
          <circle cx="28" cy="28" r="3.5" fill="currentColor" opacity="0.5" />
          {/* Motif belah ketupat sudut */}
          <path
            d="M 0 0 L 14 14 L 0 28 Z M 56 0 L 42 14 L 56 28 Z M 0 56 L 14 42 L 0 28 Z M 56 56 L 42 42 L 56 28 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.75"
            opacity="0.25"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#islamic-8star)" />
    </svg>
  );
}
