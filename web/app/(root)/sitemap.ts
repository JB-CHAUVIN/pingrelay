import { MetadataRoute } from "next";
import { i18n } from "@/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://pingrelay.live";

  // Static pages that exist in all languages
  const staticPages = [
    "",
    "/dashboard",
    "/dashboard/phones",
    "/dashboard/templates",
    "/dashboard/schedules",
  ];

  const sitemap: MetadataRoute.Sitemap = [];

  // Generate URLs for each locale
  for (const locale of i18n.locales) {
    for (const page of staticPages) {
      sitemap.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "daily" : "weekly",
        priority: page === "" ? 1 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            i18n.locales.map((l) => [l, `${baseUrl}/${l}${page}`])
          ),
        },
      });
    }
  }

  return sitemap;
}
