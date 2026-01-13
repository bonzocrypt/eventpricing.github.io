type TicketmasterClassification = {
  segmentName?: string;
  genreName?: string;
  subGenreName?: string;
};

function norm(s?: string): string {
  return (s || "").trim().toLowerCase();
}

function has(hay?: string, needle?: string): boolean {
  return norm(hay).includes(norm(needle));
}

/**
Canonical slugs used by the site (must match src/config/categories.ts):
concerts, festivals, food-drink, family, comedy, sports, nightlife, arts-theater, markets, holiday, outdoors, community, classes, networking, fitness, charity, cultural, home-garden, car-shows, spiritual
*/
export function mapTicketmasterToCategorySlugs(c: TicketmasterClassification): string[] {
  const segment = norm(c.segmentName);
  const genre = norm(c.genreName);
  const sub = norm(c.subGenreName);

  // Sports
  if (segment === "sports") return ["sports"];

  // Music -> concerts
  if (segment === "music") return ["concerts"];

  // Family
  if (segment === "family") return ["family"];

  // Arts & Theatre -> arts-theater or comedy
  if (segment === "arts & theatre" || segment === "arts and theatre") {
    if (has(genre, "comedy") || has(sub, "comedy")) return ["comedy"];
    return ["arts-theater"];
  }

  // Miscellaneous sometimes holds food, fairs, markets
  if (segment === "miscellaneous") {
    if (has(genre, "food") || has(sub, "food") || has(genre, "drink") || has(sub, "drink")) {
      return ["food-drink"];
    }
    if (has(genre, "fair") || has(sub, "fair") || has(genre, "festival") || has(sub, "festival")) {
      return ["festivals"];
    }
    if (has(genre, "market") || has(sub, "market") || has(genre, "popup") || has(sub, "popup")) {
      return ["markets"];
    }
  }

  // Keyword fallbacks
  if (has(genre, "comedy") || has(sub, "comedy")) return ["comedy"];
  if (has(genre, "theatre") || has(genre, "theater") || has(sub, "theatre") || has(sub, "theater")) {
    return ["arts-theater"];
  }
  if (has(genre, "music") || has(sub, "music")) return ["concerts"];

  return [];
}
