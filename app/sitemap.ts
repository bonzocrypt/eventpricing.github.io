// C:\EventPricing\eventpricing\app\sitemap.ts

import type { MetadataRoute } from "next";
import { site } from "@/src/config/site";
import { categories } from "@/src/config/categories";
import { timeframes } from "@/src/config/timeframes";
import { runIngest } from "@/src/lib/ingest/runIngest";

function baseUrl(): string {
  const anySite = site as unknown as { url?: string; domain?: string };
  if (anySite.url && typeof anySite.url === "string") return anySite.url;
  if (anySite.domain && typeof anySite.domain === "string") return `https://${anySite.domain}`;
  return "https://eventpricing.com";
}

function slugifyCity(city: string): string {
  return city
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const root = baseUrl();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  const add = (path: string, priority: number) => {
    entries.push({
      url: `${root}${path}`,
      lastModified: now,
      changeFrequency: "daily",
      priority,
    });
  };

  add("/", 1.0);
  add("/time", 0.9);
  add("/category", 0.9);

  for (const t of timeframes) add(`/time/${t.slug}`, 0.8);
  for (const c of categories) add(`/category/${c.slug}`, 0.8);

  // Cities: only from current ingest results, plus the default city
  const defaultCitySlug = "tampa";
  const citySlugs = new Set<string>([defaultCitySlug]);

  try {
    const { events } = await runIngest({ citySlug: defaultCitySlug });
    for (const e of events) {
      const city = (e.place?.city || "").trim();
      if (!city) continue;
      citySlugs.add(slugifyCity(city));
    }
  } catch {
    // If ingest fails, keep only the default city
  }

  for (const slug of Array.from(citySlugs).sort()) {
    add(`/city/${slug}`, 0.65);
  }

  return entries;
}
