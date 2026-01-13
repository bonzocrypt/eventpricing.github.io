import { site, categories } from "@/src/config/site";

export default function Home() {
  const topCategories = categories.slice(0, 8);

  return (
    <>
      <h1>{site.tagline}</h1>
      <p>
        EventPricing shows events happening near you across Southwest Florida,
        including concerts, festivals, markets, family events, and more.
      </p>

      <p>
        <a href="/time">Browse by time</a> or <a href="/category">browse by category</a>.
      </p>

      <h2>Popular categories</h2>
      <ul>
        {topCategories.map((c) => (
          <li key={c.id}>
            <a href={`/category/${c.slug}`}>{c.label}</a>
          </li>
        ))}
      </ul>
    </>
  );
}
