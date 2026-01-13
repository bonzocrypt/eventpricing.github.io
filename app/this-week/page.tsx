// app/this-week/page.tsx

import EventCard, { type EventCardData } from "@/src/components/EventCard";
import { getEventsForTimeSlug } from "@/src/lib/events/getEvents";
import type { NormalizedEvent } from "@/src/lib/events/eventTypes";

function toEventCardData(e: NormalizedEvent): EventCardData {
  return {
    id: e.id,
    title: e.title,
    startDateISO: e.dateTime.startISO,
    city: e.place.city || "",
    venue: e.place.name,
    priceText: e.price?.display || "",
    imageUrl: e.images?.[0] || "",
    href: `/event/${e.slug}`,
  };
}

export default async function ThisWeekPage() {
  const events = await getEventsForTimeSlug("this-week");

  return (
    <>
      <h1>This Week</h1>
      <p>Events happening in the next 7 days near you.</p>

      {events.map((e) => (
        <EventCard key={e.id} event={toEventCardData(e)} />
      ))}
    </>
  );
}
