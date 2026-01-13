import type { Metadata } from "next";
import { site } from "@/src/config/site";
import { timeframes } from "@/src/config/timeframes";

export const metadata: Metadata = {
  title: `Browse by Time | ${site.name}`,
  description:
    "Browse events by time including today, tonight, this weekend, this week, and more.",
  alternates: {
    canonical: `https://${site.domain}/time`,
  },
};

export default function TimeIndexPage() {
  return (
    <>
      <h1>Browse by Time</h1>
      <p>Select a time frame to view events.</p>

      <ul>
        {timeframes
          .filter((t) => t.indexable)
          .map((t) => (
            <li key={t.id}>
              <a href={`/time/${t.slug}`}>{t.label}</a>
            </li>
          ))}
      </ul>
    </>
  );
}
