import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SITE_URL, SCHOOL_NAME, SCHOOL_SHORT } from "@/lib/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: "variable",
});

const SITE_DESCRIPTION =
  "Platform publikasi tulisan santri IMSHUS Isy Karima dengan sistem review guru. Baca cerita, opini, dan puisi terbaik dari para santri.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SCHOOL_SHORT,
    template: `%s | ${SCHOOL_SHORT}`,
  },
  description: SITE_DESCRIPTION,
  verification: {
    google: "epw7CsLOZVzH1XggzU7k__L0r4Di_jhL-Y3yYn6dkgA",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: SCHOOL_SHORT,
    title: SCHOOL_SHORT,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/imshus-logo.png",
        width: 512,
        height: 512,
        alt: `${SCHOOL_NAME} - ${SCHOOL_SHORT}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SCHOOL_SHORT,
    description: SITE_DESCRIPTION,
    images: ["/imshus-logo.png"],
  },
  icons: {
    icon: "/icon.png",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
