// app/api/ingest/route.ts

import { NextResponse } from "next/server";
import { runIngest } from "@/src/lib/ingest/runIngest";

export const dynamic = "force-dynamic";

function firstParam(url: URL, names: string[]): string | undefined {
  for (const n of names) {
    const v = url.searchParams.get(n);
    if (v && v.trim()) return v.trim();
  }
  return undefined;
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  // Support both old and new param names
  const citySlug = firstParam(url, ["citySlug", "city"]);
  const categorySlug = firstParam(url, ["categorySlug", "category"]);
  const timeSlug = firstParam(url, ["timeSlug", "time"]);

  const { events, summary } = await runIngest({
    citySlug,
    categorySlug,
    timeSlug,
  });

  return NextResponse.json({
    summary,
    sample: (events || []).slice(0, 15).map((e) => ({
      id: e.id,
      title: e.title,
      startISO: e.dateTime?.startISO,
      city: e.place?.city,
      venue: e.place?.name,
      categorySlugs: (e.categories || []).map((c) => c.slug),
      ticketsUrl: e.ticketsUrl,
      sources: (e.sources || []).map((s) => `${s.source}:${s.sourceId}`),
    })),
  });
}
