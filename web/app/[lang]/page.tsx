import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import WithWithout from "@/components/WithWithout";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import { getDictionary } from "@/i18n/get-dictionary";
import { DictionaryProvider } from "@/i18n/dictionary-provider";
import { i18n, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;

  // Validate locale
  if (!i18n.locales.includes(lang as Locale)) {
    notFound();
  }

  const dict = await getDictionary(lang);

  return (
    <DictionaryProvider dictionary={dict} lang={lang}>
      <Header />
      <Hero />
      <Problem />
      <WithWithout />
      <Pricing />
      <FAQ />
      <Footer />
    </DictionaryProvider>
  );
}
