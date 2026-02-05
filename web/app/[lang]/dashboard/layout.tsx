import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/libs/next-auth";
import config from "@/config";
import DashboardLayout from "@/components/_features/Dashboard/DashboardLayout";
import { getDictionary } from "@/i18n/get-dictionary";
import { DictionaryProvider } from "@/i18n/dictionary-provider";
import { Locale } from "@/i18n/config";

// This is a server-side component to ensure the user is logged in.
// If not, it will redirect to the login page.
// It's applied to all subpages of /[lang]/dashboard in /app/[lang]/dashboard/*** pages
export default async function LayoutPrivate({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const session = await auth();

  if (!session) {
    redirect(config.auth.loginUrl);
  }

  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <DictionaryProvider dictionary={dict} lang={lang}>
      <DashboardLayout>{children}</DashboardLayout>
    </DictionaryProvider>
  );
}
