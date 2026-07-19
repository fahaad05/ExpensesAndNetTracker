export const dynamic = "force-dynamic";

import type { Metadata } from "next";

import { FloatingCalculator } from "@/components/floating-calculator";
import { defaultLocale, getTranslations } from "@/lib/translations";

import "./globals.css";

const t = getTranslations(defaultLocale);

export const metadata: Metadata = {
  title: t.metadata.title,
  description: t.metadata.description
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={defaultLocale} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        {children}
        <FloatingCalculator />
      </body>
    </html>
  );
}
