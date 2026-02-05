import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Viewport } from "next";
import { getSEOTags } from "@/libs/seo";
import ClientLayout from "@/components/LayoutClient";
import config from "@/config";
import { i18n, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { notFound } from "next/navigation";
import "../globals.css";

const font = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: config.colors.main,
  width: "device-width",
  initialScale: 1,
};

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;

  // Validate locale
  if (!i18n.locales.includes(lang as Locale)) {
    return getSEOTags();
  }

  const dict = await getDictionary(lang);

  return getSEOTags({
    title: dict.seo.home.title,
    description: dict.seo.home.description,
    canonicalUrlRelative: `/${lang}`,
  });
}

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;

  // Validate locale - return 404 if invalid
  if (!i18n.locales.includes(lang as Locale)) {
    notFound();
  }

  return (
    <html lang={lang} data-theme={config.colors.theme} className={font.className}>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
