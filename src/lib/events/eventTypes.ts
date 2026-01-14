// src/lib/events/eventTypes.ts

export type EventSource = {
  source: "ticketmaster" | "eventbrite" | "livenation" | "other";
  sourceId: string;
  url?: string;
  fetchedAtISO: string;
};



export type EventCategoryRef = {
  slug: string;
};

export type NormalizedEvent = {
  id: string;
  slug: string;

  title: string;

  dateTime: {
    startISO: string;
    timezone?: string;
  };

  place: {
    name: string;
    city?: string;
    region?: string;
    country?: string;
    lat?: number;
    lng?: number;
  };

  categories: EventCategoryRef[];

  price?: {
    currency: "USD";
    min?: number;
    max?: number;
    display?: string;
  };

  images?: string[];
  ticketsUrl?: string;

  status: "scheduled" | "cancelled" | "postponed" | "ended";

  sources: EventSource[];

  createdAtISO: string;
  updatedAtISO: string;
};

export function buildEventSlug(title: string, startISO: string, city?: string): string {
  const date = new Date(startISO);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");

  const base = `${title} ${city || ""} ${y}-${m}-${d}`
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return base || `event-${y}${m}${d}`;
}

export function buildCanonicalEventId(args: {
  title: string;
  startISO: string;
  venueName: string;
  city?: string;
  region?: string;
}): string {
  const key = `${args.title}|${args.startISO}|${args.venueName}|${args.city || ""}|${args.region || ""}`
    .trim()
    .toLowerCase();

  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }

  return `evt_${hash.toString(16)}`;
}

export function toCanonicalEventHref(event: Pick<NormalizedEvent, "slug" | "id">): string {
  if (event.slug && event.slug.trim().length > 0) return `/event/${event.slug}`;
  return `/event/${event.id}`;
}
