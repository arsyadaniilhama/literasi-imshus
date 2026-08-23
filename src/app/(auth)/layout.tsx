import { IslamicPattern } from "@/components/ui/islamic-pattern";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-gold/10 px-4 py-10">
      <IslamicPattern className="opacity-[0.3]" />
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}