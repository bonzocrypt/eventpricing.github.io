import { categories, site } from "@/src/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Event Categories | ${site.name}`,
  description:
    "Browse event categories including concerts, festivals, family events, markets, comedy, sports, and more.",
  alternates: {
    canonical: `https://${site.domain}/category`,
  },
};

export default function CategoryIndexPage() {
  return (
    <>
      <h1>Event Categories</h1>
      <p>Browse events by category.</p>

      <ul>
        {categories.map((c) => (
          <li key={c.id}>
            <a href={`/category/${c.slug}`}>{c.label}</a>
          </li>
        ))}
      </ul>
    </>
  );
}
