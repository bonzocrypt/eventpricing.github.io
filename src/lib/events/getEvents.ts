// C:\EventPricing\eventpricing\src\lib\events\getEvents.ts

import type { NormalizedEvent } from "./eventTypes";
import { inTimeBucket, type TimeBucketSlug } from "./timeBuckets";
import { runIngest } from "../ingest/runIngest";

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

function isNormalizedEventArray(x: any): x is NormalizedEvent[] {
  if (!Array.isArray(x)) return false;
  if (x.length === 0) return true;

  const e = x[0];
  return (
    !!e &&
    typeof e === "object" &&
    typeof e.id === "string" &&
    typeof e.slug === "string" &&
    typeof e.title === "string" &&
    !!e.dateTime &&
    typeof e.dateTime.startISO === "string" &&
    !!e.place &&
    typeof e.place.city === "string"
  );
}

function extractEventsFromUnknown(x: any): NormalizedEvent[] {
  if (isNormalizedEventArray(x)) return x;

  if (!x || typeof x !== "object") return [];

  // Common shapes we have seen during ingest iterations
  const candidates = [
    (x as any).events,
    (x as any).data,
    (x as any).items,
    (x as any).result,
    (x as any).sample,
    (x as any).payload?.events,
    (x as any).payload?.data,
  ];

  for (const c of candidates) {
    if (isNormalizedEventArray(c)) return c;
  }

  // Sometimes the ingest returns { sample: [...] } where sample is already normalized
  for (const c of candidates) {
    if (Array.isArray(c) && c.length > 0 && isNormalizedEventArray(c)) return c;
  }

  return [];
}

async function ingestNormalized(args: {
  timeSlug?: string;
  categorySlug?: string;
  citySlug?: string;
}): Promise<NormalizedEvent[]> {
  const raw = await runIngest({
    timeSlug: args.timeSlug,
    categorySlug: args.categorySlug,
    citySlug: args.citySlug,
  });

  const plain = await toPlainObject(raw);
  return extractEventsFromUnknown(plain);
}

export async function getEventsForTimeSlug(timeSlug: string): Promise<NormalizedEvent[]> {
  if (!timeSlug) return [];

  const bucket = timeSlug as TimeBucketSlug;

  const events = await ingestNormalized({ timeSlug });
  const filtered = events.filter((e) => inTimeBucket(e.dateTime.startISO, bucket));

  return sortSoonestFirst(filtered);
}

export async function getEventsForCategorySlug(categorySlug: string): Promise<NormalizedEvent[]> {
  if (!categorySlug) return [];

  const events = await ingestNormalized({ categorySlug });
  const filtered = events.filter((e) => e.categories?.some((c) => c.slug === categorySlug));

  return sortSoonestFirst(filtered);
}

export async function getEventsForCitySlug(citySlug: string): Promise<NormalizedEvent[]> {
  if (!citySlug) return [];

  const events = await ingestNormalized({ citySlug });

  const filtered = events.filter((e) => {
    const c = (e.place.city || "").toLowerCase().replace(/\s+/g, "-");
    return c === citySlug.toLowerCase();
  });

  return sortSoonestFirst(filtered);
}
