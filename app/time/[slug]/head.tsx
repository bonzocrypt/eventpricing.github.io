// C:\EventPricing\eventpricing\app\time\[slug]\head.tsx

import { site } from "@/src/config/site";
import { timeframes } from "@/src/config/timeframes";
import { getEventsForTimeSlug } from "@/src/lib/events/getEvents";
import type { NormalizedEvent } from "@/src/lib/events/eventTypes";

type Props = {
  params: Promise<{ slug: string }>;
};

function buildItemListJsonLd(timeSlug: string, events: NormalizedEvent[]) {
  const pageUrl = `${site.url}/time/${timeSlug}`;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    url: pageUrl,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: events.length,
    itemListElement: events.slice(0, 50).map((e, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${site.url}/event/${e.slug}`,
      item: {
        "@type": "Event",
        name: e.title,
        startDate: e.dateTime.startISO,
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
    })),
  };
}

export default async function Head({ params }: Props) {
  const { slug } = await params;
  const tf = timeframes.find((t) => t.slug === slug);

  if (!tf) return null;

  const events = await getEventsForTimeSlug(tf.slug);
  const jsonLd = buildItemListJsonLd(tf.slug, events);

  return (
    <script
      id="time-itemlist-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
