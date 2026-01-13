// C:\EventPricing\eventpricing\app\city\[slug]\page.tsx

import type { Metadata } from "next";
import { site } from "@/src/config/site";
import EventCard, { type EventCardData } from "@/src/components/EventCard";
import { getEventsForCitySlug } from "@/src/lib/events/getEvents";
import type { NormalizedEvent } from "@/src/lib/events/eventTypes";

type Props = {
  params: Promise<{ slug: string }>;
};

function baseUrl(): string {
  const anySite = site as unknown as { url?: string; domain?: string };
  if (anySite.url && typeof anySite.url === "string") return anySite.url;
  if (anySite.domain && typeof anySite.domain === "string") return `https://${anySite.domain}`;
  return "https://eventpricing.com";
}

function titleCaseFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function toEventHref(e: NormalizedEvent): string {
  if (e.ticketsUrl) {
    return `/event/${e.slug}?out=${encodeURIComponent(e.ticketsUrl)}`;
  }
  return `/event/${e.slug}`;
}

function toEventCardData(e: NormalizedEvent): EventCardData {
  return {
    id: e.id,
    title: e.title,
    startDateISO: e.dateTime.startISO,
    city: e.place.city || "",
    venue: e.place.name,
    priceText: e.price?.display || "",
    imageUrl: e.images?.[0] || "",
    href: toEventHref(e),
  };
}

function buildItemListJsonLd(pageTitle: string, events: NormalizedEvent[]) {
  const root = baseUrl();

  const itemListElement = events.map((e, idx) => {
    const url = `${root}/event/${e.slug}`;

    return {
      "@type": "ListItem",
      position: idx + 1,
      url,
      item: {
        "@type": "Event",
        name: e.title,
        startDate: e.dateTime.startISO,
        url,
        location: {
          "@type": "Place",
          name: e.place.name,
          address: {
            "@type": "PostalAddress",
            addressLocality: e.place.city || "",
            addressRegion: e.place.region || "",
            addressCountry: e.place.country || "US",
          },
        },
      },
    };
  });

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: pageTitle,
    itemListElement,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cityName = titleCaseFromSlug(slug);

  return {
    title: `${cityName} Events | ${site.name}`,
    description: `Browse events happening in ${cityName}. Updated frequently.`,
    alternates: {
      canonical: `https://${site.domain}/city/${slug}`,
    },
  };
}

export default async function CityPage({ params }: Props) {
  const { slug } = await params;

  const cityName = titleCaseFromSlug(slug);
  const events = await getEventsForCitySlug(slug);

  const pageTitle = `${cityName} Events`;
  const itemListJsonLd = buildItemListJsonLd(pageTitle, events.slice(0, 50));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <h1>{cityName}</h1>
      <p>Events happening in {cityName}.</p>

      {events.length === 0 ? (
        <p>No events found for this city right now.</p>
      ) : (
        events.map((e) => <EventCard key={e.id} event={toEventCardData(e)} />)
      )}
    </>
  );
}
