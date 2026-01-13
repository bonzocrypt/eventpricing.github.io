// C:\EventPricing\eventpricing\app\event\[slug]\page.tsx

import Link from "next/link";
import Script from "next/script";
import { site } from "@/src/config/site";
import { runIngest } from "@/src/lib/ingest/runIngest";
import type { NormalizedEvent } from "@/src/lib/events/eventTypes";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function cityToSlug(city?: string): string {
  return (city || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function safeOne(
  sp: Record<string, string | string[] | undefined>,
  key: string
): string {
  const v = sp[key];
  if (Array.isArray(v)) return typeof v[0] === "string" ? v[0] : "";
  return typeof v === "string" ? v : "";
}

function buildTicketSearchUrl(title: string, city?: string): string {
  const q = `${title} ${city || ""}`.trim();
  return `https://www.ticketmaster.com/search?q=${encodeURIComponent(q)}`;
}

function toISODateTime(iso: string): string {
  try {
    return new Date(iso).toISOString();
  } catch {
    return iso;
  }
}

function buildEventJsonLd(event: NormalizedEvent) {
  const city = event.place.city || "";
  const region = event.place.region || "";
  const country = event.place.country || "US";
  const canonicalUrl = `${site.url}/event/${event.slug}`;

  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: toISODateTime(event.dateTime.startISO),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: canonicalUrl,
    location: {
      "@type": "Place",
      name: event.place.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: city,
        addressRegion: region,
        addressCountry: country,
      },
    },
  };

  if (event.ticketsUrl) {
    jsonLd.offers = {
      "@type": "Offer",
      url: event.ticketsUrl,
      availability: "https://schema.org/InStock",
      priceCurrency: "USD",
    };
    if (typeof event.price?.min === "number") jsonLd.offers.price = event.price.min;
  }

  return jsonLd;
}

export default async function EventPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = searchParams ? await searchParams : {};

  const citySlug = safeOne(sp, "city");
  const out = safeOne(sp, "out");

  const ingests = await Promise.all([
    runIngest({}),
    runIngest({ citySlug: "tampa" }),
    citySlug ? runIngest({ citySlug }) : Promise.resolve({ events: [] } as any),
  ]);

  const mergedEvents: NormalizedEvent[] = [];
  const seen = new Set<string>();

  for (const r of ingests) {
    for (const e of r.events as NormalizedEvent[]) {
      if (seen.has(e.slug)) continue;
      seen.add(e.slug);
      mergedEvents.push(e);
    }
  }

  const event = mergedEvents.find((e) => e.slug === slug);

  if (!event) {
    const fallbackSearch = buildTicketSearchUrl(slug.replace(/-/g, " "), citySlug);

    return (
      <>
        <h1>Event</h1>
        <p>This event listing is available, but full details are not loaded yet.</p>

        {out ? (
          <p>
            <a href={out} target="_blank" rel="noreferrer">
              Open tickets
            </a>
          </p>
        ) : (
          <p>
            <a href={fallbackSearch} target="_blank" rel="noreferrer">
              Search tickets
            </a>
          </p>
        )}

        <p>
          <Link href="/time/this-week">Back to This Week</Link>
        </p>
      </>
    );
  }

  const eventCitySlug = cityToSlug(event.place.city);
  const jsonLd = buildEventJsonLd(event);
  const ticketSearchUrl = buildTicketSearchUrl(event.title, event.place.city);

  return (
    <>
      <Script
        id="event-jsonld"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1>{event.title}</h1>

      <p>
        {event.place.city ? (
          <>
            <Link href={`/city/${eventCitySlug}`}>{event.place.city}</Link>
            {event.place.region ? `, ${event.place.region}` : ""}
          </>
        ) : (
          "Location TBA"
        )}
      </p>

      <p>{event.place.name}</p>

      <p>
        Start:{" "}
        {new Date(event.dateTime.startISO).toLocaleString("en-US", {
          timeZone: "America/New_York",
        })}
      </p>

      {event.price?.display ? <p>Price: {event.price.display}</p> : null}

      {event.ticketsUrl ? (
        <p>
          <a href={event.ticketsUrl} target="_blank" rel="noreferrer">
            Tickets
          </a>
        </p>
      ) : (
        <p>
          <a href={ticketSearchUrl} target="_blank" rel="noreferrer">
            Search tickets
          </a>
        </p>
      )}
    </>
  );
}
