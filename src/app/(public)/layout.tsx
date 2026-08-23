import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { SCHOOL_SHORT } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    default: SCHOOL_SHORT,
    template: `%s | ${SCHOOL_SHORT}`,
  },
  description:
    "Platform publikasi tulisan santri IMSHUS Isy Karima dengan sistem review guru.",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />

      <main className="flex-1">{children}</main>

      <PublicFooter />
    </div>
  );
}
