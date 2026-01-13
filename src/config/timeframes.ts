export type Timeframe = {
  id: string;
  label: string;
  slug: string;
  indexable: boolean;
};

export const timeframes: Timeframe[] = [
  { id: "today", label: "Today", slug: "today", indexable: true },
  { id: "tonight", label: "Tonight", slug: "tonight", indexable: true },
  { id: "this-weekend", label: "This Weekend", slug: "this-weekend", indexable: true },
  { id: "this-week", label: "This Week", slug: "this-week", indexable: true },
  { id: "next-7-days", label: "Next 7 Days", slug: "next-7-days", indexable: true },
  { id: "next-30-days", label: "Next 30 Days", slug: "next-30-days", indexable: true },
  { id: "this-month", label: "This Month", slug: "this-month", indexable: true },
  { id: "this-year", label: "This Year", slug: "this-year", indexable: true },
];
