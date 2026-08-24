import type { Metadata } from "next";
import { IslamicPattern } from "@/components/ui/islamic-pattern";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-gold/10 px-4 py-10">
      {/* Glow orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl animate-glow-pulse"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-gold/20 blur-3xl animate-glow-pulse"
        style={{ animationDelay: "2s" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-gold/15 blur-3xl animate-glow-pulse"
        style={{ animationDelay: "4s" }}
      />
      <IslamicPattern className="opacity-[0.3]" />
      <div className="relative w-full max-w-[480px]">{children}</div>
    </div>
  );
}