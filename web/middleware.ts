import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "./i18n/config";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // 🔒 Rediriger vers HTTPS si on est sur HTTP
  if (request.nextUrl.protocol === "http:") {
    url.protocol = "https:";
    return NextResponse.redirect(url);
  }

  // Skip middleware for:
  // - API routes
  // - Static files (_next/static, _next/image, favicon.ico, etc.)
  // - SEO files (sitemap.xml, robots.txt, llms.txt)
  if (
      pathname.startsWith("/api/") ||
      pathname.startsWith("/_next/") ||
      pathname.includes("/favicon") ||
      pathname.includes(".") ||
      pathname.startsWith("/sitemap") ||
      pathname.startsWith("/robots") ||
      pathname.startsWith("/llms")
  ) {
    return NextResponse.next();
  }

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
      (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    url.pathname = `/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

function getLocale(request: NextRequest): string {
  // Try to get locale from cookie
  const localeCookie = request.cookies.get("NEXT_LOCALE");
  if (localeCookie && i18n.locales.includes(localeCookie.value as any)) {
    return localeCookie.value;
  }

  // Try to get locale from Accept-Language header
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const languages = acceptLanguage
        .split(",")
        .map((lang) => lang.split(";")[0].trim().toLowerCase());

    for (const lang of languages) {
      // Check for exact match (e.g., "fr")
      if (i18n.locales.includes(lang as any)) {
        return lang;
      }
      // Check for language prefix (e.g., "fr-FR" -> "fr")
      const langPrefix = lang.split("-")[0];
      if (i18n.locales.includes(langPrefix as any)) {
        return langPrefix;
      }
    }
  }

  // Default to defaultLocale
  return i18n.defaultLocale;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap|robots|llms).*)",
  ],
};
