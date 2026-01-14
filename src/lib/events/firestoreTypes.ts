// C:\EventPricing\src\lib\events\firestoreTypes.ts

import type { NormalizedEvent, EventSource } from "./eventTypes";

/**
Firestore collections (planned)

events/{eventId}
  canonical normalized event for the app

events/{eventId}/sources/{source}_{sourceId}
  provider specific snapshot and linkage

cities/{citySlug}
  canonical city entity for /city/[slug]
*/

export type FirestoreTimestampLike = {
  toDate?: () => Date;
  seconds?: number;
  nanoseconds?: number;
};

export type FirestoreEventDoc = {
  // identifiers
  id: string;
  slug: string;

  // core display
  title: string;
  description?: string;

  // timing and location
  startISO: string;
  endISO?: string | null;
  timezone?: string;

  venueName: string;
  city?: string;
  region?: string;
  country?: string;
  lat?: number;
  lng?: number;

  // classification
  categorySlugs: string[];
  timeSlugs?: string[];

  // commerce
  priceCurrency?: "USD";
  priceMin?: number;
  priceMax?: number;
  ticketsUrl?: string;

  // meta
  status: "scheduled" | "cancelled" | "postponed" | "ended";
  popularity?: number;

  images?: string[];
  performers?: string[];

  // lineage
  sources: EventSource[];

  createdAtISO: string;
  updatedAtISO: string;
};

export type FirestoreEventSourceDoc = {
  source: EventSource["source"];
  sourceId: string;
  url?: string;

  fetchedAtISO: string;
  rawHash?: string;

  // optional raw payload storage strategy
  // store small objects directly, or store in GCS later and keep pointer here
  raw?: unknown;
};

export function toFirestoreEventDoc(e: NormalizedEvent): FirestoreEventDoc {
  const startISO = e.dateTime.startISO;
const endISO =
  "endISO" in e.dateTime && typeof (e.dateTime as any).endISO === "string"
    ? (e.dateTime as any).endISO
    : null;


  return {
    id: e.id,
    slug: e.slug,

    title: e.title,
description: "description" in e ? (e as any).description : undefined,

    startISO,
    endISO,
    timezone: e.dateTime.timezone,

    venueName: e.place.name || "TBA",
    city: e.place.city,
    region: e.place.region,
    country: e.place.country,
    lat: e.place.lat,
    lng: e.place.lng,

    categorySlugs: e.categories.map((c) => c.slug),
timeSlugs: "timeBuckets" in e ? (e as any).timeBuckets?.map((t: any) => t.slug) : undefined,


    priceCurrency: e.price?.currency,
    priceMin: e.price?.min,
    priceMax: e.price?.max,
    ticketsUrl: e.ticketsUrl,

    status: e.status,
popularity: "popularity" in e ? (e as any).popularity : undefined,


    images: e.images,
performers: "performers" in e ? (e as any).performers : undefined,


    sources: e.sources,

    createdAtISO: e.createdAtISO,
    updatedAtISO: e.updatedAtISO,
  };
}
