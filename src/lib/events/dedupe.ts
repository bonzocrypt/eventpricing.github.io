// src/lib/events/dedupe.ts

import type { NormalizedEvent } from "./eventTypes";

function normalizeWhitespace(input: string): string {
  return (input || "").trim().replace(/\s+/g, " ");
}

/**
Dedupe strategy (v1)
Goal: remove exact and near exact duplicates across sources.

We use a stable "dedupeKey" derived from normalized title + start date + venue + city.
This is intentionally simple for now.
*/
export function dedupeEvents(events: NormalizedEvent[]): NormalizedEvent[] {
  const seen = new Map<string, NormalizedEvent>();

  for (const e of events) {
    const title = normalizeWhitespace(e.title).toLowerCase();
    const startISO = normalizeWhitespace(e.dateTime.startISO).toLowerCase();
    const venue = normalizeWhitespace(e.place.name).toLowerCase();
    const city = normalizeWhitespace(e.place.city || "").toLowerCase();

    const key = `${title}|${startISO}|${venue}|${city}`;

    const existing = seen.get(key);

    if (!existing) {
      seen.set(key, e);
      continue;
    }

    // If we already have one, prefer the one that has a tickets URL or price display.
    const existingScore =
      (existing.ticketsUrl ? 1 : 0) +
      (existing.price?.display ? 1 : 0) +
      ((existing.images && existing.images.length > 0) ? 1 : 0);

    const candidateScore =
      (e.ticketsUrl ? 1 : 0) +
      (e.price?.display ? 1 : 0) +
      ((e.images && e.images.length > 0) ? 1 : 0);

    if (candidateScore > existingScore) {
      seen.set(key, e);
    }
  }

  return Array.from(seen.values());
}
