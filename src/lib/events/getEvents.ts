// C:\EventPricing\eventpricing\src\lib\events\getEvents.ts

import type { NormalizedEvent } from "./eventTypes";
import { inTimeBucket, type TimeBucketSlug } from "./timeBuckets";
import { ingestAllSources } from "../ingest/ingestEvents";

type IngestResponse = {
  summary?: any;
  sample?: any[];
};

function sortSoonestFirst(events: NormalizedEvent[]): NormalizedEvent[] {
  const copy = [...events];
  copy.sort((a, b) => a.dateTime.startISO.localeCompare(b.dateTime.startISO));
  return copy;
}

function isResponseLike(x: any): x is { json: () => Promise<any> } {
  return !!x && typeof x === "object" && typeof x.json === "function";
}

async function toPlainObject(raw: unknown): Promise<any> {
  if (isResponseLike(raw)) return raw.json();

  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  return raw;
}

function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toNormalizedFromSample(item: any): NormalizedEvent {
  const id = String(item?.id || "");
  const title = String(item?.title || "Event");
  const startISO = String(item?.startISO || new Date().toISOString());

  const city = String(item?.city || "");
  const venue = String(item?.venue || "");

  const categorySlugs: string[] = Array.isArray(item?.categorySlugs) ? item.categorySlugs : [];

  const slugBase = slugifyTitle(title) || "event";
  const suffix = id ? id.slice(-6) : "000000";
  const slug = `${slugBase}-${suffix}`;

  return {
    id: id || `evt_${suffix}`,
    slug,
    title,
    dateTime: { startISO },
    place: {
      name: venue,
      city,
      region: "",
      country: "US",
    },
    categories: categorySlugs.map((s) => ({
      slug: String(s),
      label: String(s),
    })),
    ticketsUrl: item?.ticketsUrl ? String(item.ticketsUrl) : undefined,
    images: [],
    price: undefined,
    sources: Array.isArray(item?.sources) ? item.sources : [],
  } as unknown as NormalizedEvent;
}

async function ingestSample(args: {
  timeSlug?: string;
  categorySlug?: string;
  citySlug?: string;
}): Promise<NormalizedEvent[]> {
  const raw = await ingestAllSources({
    timeSlug: args.timeSlug,
    categorySlug: args.categorySlug,
    citySlug: args.citySlug,
  });

  const plain = (await toPlainObject(raw)) as IngestResponse;
  const sample = Array.isArray(plain?.sample) ? plain.sample : [];
  return sample.map(toNormalizedFromSample);
}

export async function getEventsForTimeSlug(timeSlug: string): Promise<NormalizedEvent[]> {
  if (!timeSlug) return [];

  const bucket = timeSlug as TimeBucketSlug;

  const events = await ingestSample({ timeSlug });
  const filtered = events.filter((e) => inTimeBucket(e.dateTime.startISO, bucket));

  return sortSoonestFirst(filtered);
}

export async function getEventsForCategorySlug(categorySlug: string): Promise<NormalizedEvent[]> {
  if (!categorySlug) return [];

  const events = await ingestSample({ categorySlug });
  const filtered = events.filter((e) => e.categories?.some((c) => c.slug === categorySlug));

  return sortSoonestFirst(filtered);
}

export async function getEventsForCitySlug(citySlug: string): Promise<NormalizedEvent[]> {
  if (!citySlug) return [];

  const events = await ingestSample({ citySlug });

  const filtered = events.filter((e) => {
    const c = (e.place.city || "").toLowerCase().replace(/\s+/g, "-");
    return c === citySlug.toLowerCase();
  });

  return sortSoonestFirst(filtered);
}
