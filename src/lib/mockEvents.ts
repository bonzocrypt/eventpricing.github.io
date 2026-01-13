// C:\EventPricing\eventpricing\src\lib\mockEvents.ts

import type { NormalizedEvent } from "./events/eventTypes";
import {
  buildCanonicalEventId,
  buildEventSlug,
} from "./events/eventTypes";

function now(): Date {
  return new Date();
}

function nowISO(): string {
  return new Date().toISOString();
}

function addHoursISO(hoursFromNow: number): string {
  const d = new Date(now().getTime() + hoursFromNow * 60 * 60 * 1000);
  return d.toISOString();
}

function mkEvent(input: {
  title: string;
  startISO: string;
  city: string;
  region: string;
  venueName: string;
  categorySlugs: string[];
  ticketsUrl?: string;
  priceDisplay?: string;
}): NormalizedEvent {
  const createdAtISO = nowISO();
  const updatedAtISO = createdAtISO;

  const id = buildCanonicalEventId({
    title: input.title,
    startISO: input.startISO,
    venueName: input.venueName,
    city: input.city,
    region: input.region,
  });

  const slug = buildEventSlug(input.title, input.startISO, input.city);

  return {
    id,
    slug,

    title: input.title,

    dateTime: {
      startISO: input.startISO,
      timezone: "America/New_York",
    },

    place: {
      name: input.venueName,
      city: input.city,
      region: input.region,
      country: "US",
    },

    categories: input.categorySlugs.map((slug) => ({ slug })),

    price: input.priceDisplay
      ? { currency: "USD", display: input.priceDisplay }
      : undefined,

    ticketsUrl: input.ticketsUrl,

    status: "scheduled",

    sources: [
      {
        source: "other",
        sourceId: id,
        url: input.ticketsUrl,
        fetchedAtISO: updatedAtISO,
      },
    ],

    createdAtISO,
    updatedAtISO,
  };
}

export const mockEvents: NormalizedEvent[] = [
  mkEvent({
    title: "Downtown Food Truck Night",
    startISO: addHoursISO(28),
    city: "Sarasota",
    region: "FL",
    venueName: "Main Street District",
    categorySlugs: ["food-and-drink"],
    ticketsUrl: "https://example.com/tickets/food-truck-night",
    priceDisplay: "Free",
  }),
  mkEvent({
    title: "Indie Live Music Showcase",
    startISO: addHoursISO(54),
    city: "Tampa",
    region: "FL",
    venueName: "The Riverside Room",
    categorySlugs: ["music"],
    ticketsUrl: "https://example.com/tickets/indie-showcase",
    priceDisplay: "$20.00",
  }),
  mkEvent({
    title: "Family Fun Day at the Park",
    startISO: addHoursISO(110),
    city: "Bradenton",
    region: "FL",
    venueName: "Riverwalk Park",
    categorySlugs: ["family"],
    ticketsUrl: "https://example.com/tickets/family-fun-day",
    priceDisplay: "Free",
  }),
];
