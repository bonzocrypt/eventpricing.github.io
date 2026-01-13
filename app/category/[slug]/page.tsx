import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "@/src/config/site";
import { categories } from "@/src/config/categories";
import EventCard, { type EventCardData } from "@/src/components/EventCard";
import { runIngest } from "@/src/lib/ingest/runIngest";
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

function sortSoonestFirst(events: NormalizedEvent[]): NormalizedEvent[] {
  const copy = [...events];
  copy.sort((a, b) => a.dateTime.startISO.localeCompare(b.dateTime.startISO));
  return copy;
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
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    return {
      title: `Category not found | ${site.name}`,
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${category.label} Events | ${site.name}`,
    description: category.description,
    alternates: {
      canonical: `https://${site.domain}/category/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  if (!category) return notFound();

  const defaultCitySlug = "tampa";

  const result = await runIngest({ categorySlug: slug, citySlug: defaultCitySlug });

  const eventsRaw: NormalizedEvent[] = Array.isArray((result as any)?.events)
    ? ((result as any).events as NormalizedEvent[])
    : [];

  const filtered = sortSoonestFirst(
    eventsRaw.filter((e) => Array.isArray(e.categories) && e.categories.some((c) => c.slug === slug))
  );

  const pageTitle = `${category.label} Events`;
  const itemListJsonLd = buildItemListJsonLd(pageTitle, filtered.slice(0, 50));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <h1>{category.label}</h1>
      <p>{category.description}</p>

      {filtered.length === 0 ? (
        <p>No events found for this category right now.</p>
      ) : (
        filtered.map((e) => <EventCard key={e.id} event={toEventCardData(e)} />)
      )}
    </>
  );
}
