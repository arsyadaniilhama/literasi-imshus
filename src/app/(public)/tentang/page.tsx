import type { Metadata } from "next";
import { SCHOOL_NAME, SCHOOL_SHORT } from "@/lib/constants";
import { PenLine, ShieldCheck, Sparkles } from "lucide-react";
import { IslamicPattern } from "@/components/ui/islamic-pattern";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Tentang",
  description: `Tentang ${SCHOOL_SHORT} — platform literasi santri IMSHUS Isy Karima.`,
};

const values = [
  {
    icon: PenLine,
    title: "Menulis",
    description:
      "Mendorong santri untuk mengekspresikan ide, pengalaman, dan pengetahuan melalui tulisan.",
  },
  {
    icon: ShieldCheck,
    title: "Review Guru",
    description:
      "Setiap tulisan melalui proses review guru untuk memastikan kualitas dan kebenaran konten.",
  },
  {
    icon: Sparkles,
    title: "Kreativitas",
    description:
      "Memberi ruang bagi karya kreatif santri: cerpen, opini, puisi, dan tulisan ilmiah populer.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero — desain sama dengan beranda */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/5 via-background to-gold/10">
        <IslamicPattern className="opacity-[0.4]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Tentang Kami
            </span>
            <h1 className="font-heading mt-6 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
              {SCHOOL_NAME}
            </h1>
            <p className="mt-5 text-lg text-muted-foreground sm:text-xl">
              {SCHOOL_SHORT} adalah platform publikasi tulisan santri di
              lingkungan pesantren IMSHUS Isy Karima. Kami percaya bahwa setiap
              santri memiliki suara dan karya yang layak dibaca banyak orang.
            </p>
          </div>
        </div>
      </section>

      {/* Konten bawah */}
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-5 sm:grid-cols-3">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-xl border border-border bg-card p-5 text-center transition-shadow hover:shadow-md"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <value.icon className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <h2 className="font-heading mt-4 text-base font-semibold">
                {value.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {value.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-border bg-muted/40 p-6 sm:p-8 border-l-2 border-primary/20">
          <h2 className="font-heading text-xl font-semibold">Tentang Platform</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Artikel yang tampil di halaman publik ini adalah tulisan santri yang
            telah melalui alur review: diajukan oleh santri, direview oleh guru,
            dan hanya diterbitkan setelah dinyatakan layak publikasi. Dengan
            begitu, pembaca dapat menikmati konten yang berkualitas dan sesuai
            dengan nilai-nilai pesantren.
          </p>
        </div>
      </div>
    </div>
  );
}
