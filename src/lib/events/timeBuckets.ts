// C:\EventPricing\eventpricing\src\lib\events\timeBuckets.ts

export type TimeBucketSlug =
  | "today"
  | "tomorrow"
  | "this-week"
  | "this-weekend"
  | "next-7-days"
  | "next-30-days";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function inTimeBucket(startISO: string, bucket: TimeBucketSlug, now = new Date()): boolean {
  const start = new Date(startISO);
  const today0 = startOfDay(now);
  const tomorrow0 = addDays(today0, 1);

  if (bucket === "today") return isSameDay(start, today0);
  if (bucket === "tomorrow") return isSameDay(start, tomorrow0);

  if (bucket === "next-7-days" || bucket === "this-week") {
    const end = addDays(today0, 7);
    return start >= today0 && start < end;
  }

  if (bucket === "next-30-days") {
    const end = addDays(today0, 30);
    return start >= today0 && start < end;
  }

  if (bucket === "this-weekend") {
    // Weekend defined as Fri 17:00 through Sun 23:59 local time.
    const day = today0.getDay(); // 0 Sun ... 5 Fri ... 6 Sat
    const daysUntilFri = (5 - day + 7) % 7;
    const fri = addDays(today0, daysUntilFri);
    const fri5pm = new Date(fri);
    fri5pm.setHours(17, 0, 0, 0);

    const sun = addDays(fri, 2);
    const sunEnd = new Date(sun);
    sunEnd.setHours(23, 59, 59, 999);

    return start >= fri5pm && start <= sunEnd;
  }

  return false;
}
