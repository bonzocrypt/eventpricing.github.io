import type { IngestContext, IngestResult } from "../ingestEvents";
import type { NormalizedEvent } from "../../events/eventTypes";
import { buildCanonicalEventId, buildEventSlug } from "../../events/eventTypes";
import { getTicketmasterApiKey } from "../env";
import { mapTicketmasterToCategorySlugs } from "../../events/categoryMap";

function nowISO(): string {
  return new Date().toISOString();
}

function formatUsd(min?: number, max?: number): string | undefined {
  const fmt = (n: number) => `$${n.toFixed(2)}`;

  if (typeof min === "number" && typeof max === "number") {
    if (min === max) return fmt(min);
    return `${fmt(min)} to ${fmt(max)}`;
  }
  if (typeof min === "number") return fmt(min);
  if (typeof max === "number") return fmt(max);
  return undefined;
}

function applyCategoryParams(params: URLSearchParams, categorySlug?: string) {
  if (!categorySlug) return;

  switch (categorySlug) {
    case "concerts":
      params.set("classificationName", "Music");
      break;

    case "sports":
      params.set("classificationName", "Sports");
      break;

    case "arts-theater":
      params.set("classificationName", "Arts & Theatre");
      break;

    case "comedy":
      params.set("classificationName", "Arts & Theatre");
      params.set("keyword", "comedy");
      break;

    case "family":
      params.set("classificationName", "Family");
      break;

    case "food-drink":
      params.set("keyword", "food OR drink OR tasting OR festival");
      break;

    case "festivals":
      params.set("keyword", "festival OR fair");
      break;

    case "markets":
      params.set("keyword", "market OR pop up OR popup");
      break;

    default:
      break;
  }
}

export async function ingestTicketmaster(ctx: IngestContext): Promise<IngestResult> {
  const fetchedAtISO = nowISO();
  const apiKey = getTicketmasterApiKey();

  const city = ctx.citySlug ? ctx.citySlug.replace(/-/g, " ") : undefined;

  const params = new URLSearchParams({
    apikey: apiKey,
    size: "200",
  });

  if (city) params.set("city", city);

  applyCategoryParams(params, ctx.categorySlug);

  const url = `https://app.ticketmaster.com/discovery/v2/events.json?${params.toString()}`;

  const res = await fetch(url, { headers: { Accept: "application/json" } });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return {
      source: "ticketmaster",
      fetchedAtISO,
      events: [],
      errors: [`${res.status} ${res.statusText}`, body],
    };
  }

  const json = await res.json();
  const rawEvents = json?._embedded?.events || [];

  const events: NormalizedEvent[] = rawEvents
    .map((e: any) => {
      const startISO = e?.dates?.start?.dateTime;
      if (!startISO) return null;

      const venue = e?._embedded?.venues?.[0];
      const classification = e?.classifications?.[0];

      const title = e?.name || "Untitled Event";
      const cityName = venue?.city?.name;
      const region = venue?.state?.stateCode;
      const venueName = venue?.name || "TBA";

      const categorySlugs = mapTicketmasterToCategorySlugs({
        segmentName: classification?.segment?.name,
        genreName: classification?.genre?.name,
        subGenreName: classification?.subGenre?.name,
      });

      const id = buildCanonicalEventId({
        title,
        startISO,
        venueName,
        city: cityName,
        region,
      });

      const slug = buildEventSlug(title, startISO, cityName);

      const min = e?.priceRanges?.[0]?.min;
      const max = e?.priceRanges?.[0]?.max;

      const display = formatUsd(
        typeof min === "number" ? min : undefined,
        typeof max === "number" ? max : undefined
      );

      const imageUrl =
        e?.images?.find((img: any) => img?.ratio === "16_9" && img?.width >= 640)?.url ||
        e?.images?.[0]?.url ||
        undefined;

      return {
        id,
        slug,
        title,
        dateTime: {
          startISO,
          timezone: venue?.timezone,
        },
        place: {
          name: venueName,
          city: cityName,
          region,
          country: "US",
          lat: venue?.location?.latitude ? Number(venue.location.latitude) : undefined,
          lng: venue?.location?.longitude ? Number(venue.location.longitude) : undefined,
        },
        categories: categorySlugs.map((s) => ({ slug: s })),
        price:
          display || typeof min === "number" || typeof max === "number"
            ? {
                currency: "USD",
                min: typeof min === "number" ? min : undefined,
                max: typeof max === "number" ? max : undefined,
                display,
              }
            : undefined,
        images: imageUrl ? [imageUrl] : [],
        ticketsUrl: e?.url,
        status: "scheduled",
        sources: [
          {
            source: "ticketmaster",
            sourceId: e.id,
            url: e.url,
            fetchedAtISO,
          },
        ],
        createdAtISO: fetchedAtISO,
        updatedAtISO: fetchedAtISO,
      } as NormalizedEvent;
    })
    .filter(Boolean) as NormalizedEvent[];

  return {
    source: "ticketmaster",
    fetchedAtISO,
    events,
    errors: [],
  };
}
