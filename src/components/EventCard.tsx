export type EventCardData = {
  id: string;
  title: string;
  startDateISO: string;
  city: string;
  venue?: string;
  priceText?: string;
  imageUrl?: string;
  href: string;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function EventCard({ event }: { event: EventCardData }) {
  return (
    <article
      style={{
        display: "grid",
        gridTemplateColumns: "84px 1fr",
        gap: "0.9rem",
        padding: "0.9rem",
        border: "1px solid rgba(245,245,247,0.12)",
        borderRadius: "12px",
        margin: "0.75rem 0",
      }}
    >
      <div
        style={{
          width: "84px",
          height: "84px",
          borderRadius: "10px",
          overflow: "hidden",
          background: "rgba(245,245,247,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.85rem",
          opacity: 0.8,
        }}
        aria-label="Event image"
      >
        {event.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.imageUrl}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          "No image"
        )}
      </div>

      <div>
        <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>
          {formatDate(event.startDateISO)} · {event.city}
          {event.venue ? ` · ${event.venue}` : ""}
        </div>

        <h3 style={{ margin: "0.3rem 0 0.35rem 0", fontSize: "1.05rem" }}>
          <a href={event.href}>{event.title}</a>
        </h3>

{event.priceText ? (
  <div style={{ fontSize: "0.9rem", opacity: 0.85 }}>
    {event.priceText}
  </div>
) : null}

      </div>
    </article>
  );
}
