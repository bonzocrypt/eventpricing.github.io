export type NavItem = {
  label: string;
  href: string;
};

export type Category = {
  id: string;
  label: string;
  slug: string;
};

export const categories: Category[] = [
  { id: "concerts", label: "Concerts and Live Music", slug: "concerts" },
  { id: "festivals", label: "Festivals and Fairs", slug: "festivals" },
  { id: "food-drink", label: "Food and Drink", slug: "food-drink" },
  { id: "family", label: "Family and Kids", slug: "family" },
  { id: "comedy", label: "Comedy", slug: "comedy" },
  { id: "sports", label: "Sports", slug: "sports" },
  { id: "nightlife", label: "Nightlife", slug: "nightlife" },
  { id: "arts-theater", label: "Arts and Theater", slug: "arts-theater" },
  { id: "markets", label: "Markets and Pop Ups", slug: "markets" },
  { id: "holiday", label: "Holiday Events", slug: "holiday" },
  { id: "outdoors", label: "Outdoor and Nature", slug: "outdoors" },
  { id: "community", label: "Community Events", slug: "community" },
  { id: "classes", label: "Classes and Workshops", slug: "classes" },
  { id: "networking", label: "Networking and Business", slug: "networking" },
  { id: "fitness", label: "Health and Fitness", slug: "fitness" },
  { id: "charity", label: "Charity and Fundraisers", slug: "charity" },
  { id: "cultural", label: "Cultural Events", slug: "cultural" },
  { id: "home-garden", label: "Home and Garden Shows", slug: "home-garden" },
  { id: "car-shows", label: "Car Shows", slug: "car-shows" },
  { id: "spiritual", label: "Religious and Spiritual", slug: "spiritual" },
];

export const site = {
  name: "EventPricing",
  domain: "eventpricing.com",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "http://localhost:3000",
  tagline: "What’s happening in Southwest Florida this week",
  description:
    "Discover concerts, festivals, family events, markets, and things to do happening this week across Southwest Florida.",
  ga4MeasurementId: "G-ZKS52S17C3",
  defaultRegion: {
    id: "fl-southwest",
    label: "Southwest Florida",
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "Time", href: "/time" },
    { label: "Categories", href: "/category" },
  ] satisfies NavItem[],
};

