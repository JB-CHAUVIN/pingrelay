import { NextResponse } from "next/server";
import { i18n } from "@/i18n/config";

export async function GET() {
  const baseUrl = "https://pingrelay.live";

  const staticPages = [
    "",
  ];

  const lastmod = new Date().toISOString();

  const urls = i18n.locales.flatMap((locale) =>
    staticPages.map((page) => {
      const loc = `${baseUrl}/${locale}${page}`;
      const priority = page === "" ? "1.0" : "0.8";
      const changefreq = page === "" ? "daily" : "weekly";

      const xhtmlLinks = i18n.locales
        .map(
          (l) =>
            `    <xhtml:link rel="alternate" hreflang="${l}" href="${baseUrl}/${l}${page}" />`
        )
        .join("\n");

      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${xhtmlLinks}
  </url>`;
    })
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
