import type { NormalizedEvent, EventSource } from "../events/eventTypes";
import { ingestTicketmaster } from "./sources/ticketmaster";

export type IngestResult = {
  source: EventSource["source"];
  fetchedAtISO: string;
  events: NormalizedEvent[];
  errors: string[];
};


export type IngestContext = {
  citySlug?: string;
  categorySlug?: string;
  timeSlug?: string;
};

export type SourceIngestor = (ctx: IngestContext) => Promise<IngestResult>;

function nowISO(): string {
  return new Date().toISOString();
}

/**
Central ingestion entrypoint.

Today: provider stubs are wired but return empty events.
Next: we wire real HTTP fetch for each provider, then dedupe and write to Firestore.
*/
export async function ingestAllSources(ctx: IngestContext): Promise<IngestResult[]> {
  const ingestors: SourceIngestor[] = [ingestTicketmaster];

  const results: IngestResult[] = [];

  for (const ingest of ingestors) {
    try {
      results.push(await ingest(ctx));
} catch (e: any) {
  results.push({
    source: "ticketmaster",
    fetchedAtISO: nowISO(),
    events: [],
    errors: [e?.message ? String(e.message) : "Unknown ingest error"],
  });
}

  }

  return results;
}
