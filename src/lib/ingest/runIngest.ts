// C:\EventPricing\eventpricing\src\lib\ingest\runIngest.ts

import { unstable_cache } from "next/cache";
import type { NormalizedEvent } from "../events/eventTypes";
import { ingestAllSources } from "./ingestEvents";
import { dedupeEvents } from "../events/dedupe";

export type RunIngestArgs = {
  timeSlug?: string;
  categorySlug?: string;
  citySlug?: string;
};

export type RunIngestResult = {
  events: NormalizedEvent[];
  summary?: any;
  sample?: any[];
};

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

function buildSummaryFromSourceResults(results: any[], dedupedCount: number) {
  const fetchedAtISO =
    results
      .map((r) => (typeof r?.fetchedAtISO === "string" ? r.fetchedAtISO : ""))
      .filter(Boolean)
      .sort()
      .slice(-1)[0] || new Date().toISOString();

  const sources = results.map((r) => ({
    source: r?.source || "unknown",
    count: Array.isArray(r?.events) ? r.events.length : 0,
    errors: Array.isArray(r?.errors) ? r.errors : [],
  }));

  const totalRaw = sources.reduce((sum: number, s: any) => sum + (s.count || 0), 0);

  return {
    fetchedAtISO,
    sources,
    totalRaw,
    totalDeduped: dedupedCount,
  };
}

/**
runIngest is the single contract the app uses.
It ALWAYS returns { events: NormalizedEvent[] }.

ingestAllSources may return:
1 an array of per source results: [{ source, fetchedAtISO, events, errors }, ...]
2 an object with events: { events, summary }
3 an api style object with sample: { summary, sample }

We normalize all shapes into { events }.
*/
async function runIngestUncached(args: RunIngestArgs): Promise<RunIngestResult> {
  const raw = await ingestAllSources({
    timeSlug: args.timeSlug,
    categorySlug: args.categorySlug,
    citySlug: args.citySlug,
  });

  const plain = await toPlainObject(raw);

  // Case 1 internal object already has events
  if (plain && Array.isArray(plain.events)) {
    const deduped = dedupeEvents(plain.events as NormalizedEvent[]);
    return {
      events: deduped,
      summary: plain.summary,
    };
  }

  // Case 2 api style has sample
  if (plain && Array.isArray(plain.sample)) {
    const deduped = dedupeEvents(plain.sample as NormalizedEvent[]);
    return {
      events: deduped,
      summary: plain.summary,
      sample: plain.sample,
    };
  }

  // Case 3 most common in this project: array of per source results
  if (Array.isArray(plain)) {
    const merged: NormalizedEvent[] = [];

    for (const r of plain) {
      if (r && Array.isArray(r.events)) {
        merged.push(...(r.events as NormalizedEvent[]));
      }
    }

    const deduped = dedupeEvents(merged);

    return {
      events: deduped,
      summary: buildSummaryFromSourceResults(plain, deduped.length),
    };
  }

  return { events: [] };
}

export async function runIngest(args: RunIngestArgs): Promise<RunIngestResult> {
  const key = `ingest:${args.timeSlug || ""}:${args.categorySlug || ""}:${args.citySlug || ""}`;

  const cached = unstable_cache(() => runIngestUncached(args), [key], {
    revalidate: 60,
    tags: ["ingest"],
  });

  return cached();
}
