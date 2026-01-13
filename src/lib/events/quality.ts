// C:\EventPricing\eventpricing\src\lib\events\quality.ts

import type { NormalizedEvent } from "./eventTypes";

const BLOCK_TITLE_CONTAINS = [
  "suite license fee",
  "license fee",
  "parking",
  "admissions",
  "non taxable",
  "taxable",
];

export function isLowQualityEvent(e: NormalizedEvent): boolean {
  const t = (e.title || "").toLowerCase();

  if (!e.dateTime?.startISO) return true;
  if (!e.place?.name) return true;

  // Filter obvious fee and administrative inventory
  for (const bad of BLOCK_TITLE_CONTAINS) {
    if (t.includes(bad)) return true;
  }

  return false;
}

export function filterHighQuality(events: NormalizedEvent[]): NormalizedEvent[] {
  return events.filter((e) => !isLowQualityEvent(e));
}
