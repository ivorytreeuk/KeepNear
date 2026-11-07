export type Category = "legacy" | "living";

export const CATEGORIES: { id: Category; label: string; short: string; body: string }[] = [
  {
    id: "legacy",
    label: "After I'm gone",
    short: "After I'm gone",
    body: "Kept sealed and released only after my death, once my release holder confirms it.",
  },
  {
    id: "living",
    label: "While I'm alive",
    short: "Time capsule",
    body: "Delivered on a date I choose, like a future birthday or anniversary. No release holder needed.",
  },
];

export function asCategory(v: unknown): Category {
  return v === "living" ? "living" : "legacy";
}

/** Tomorrow's date as YYYY-MM-DD (UK time is close enough for a date picker minimum). */
export function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function fmtDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** One line describing when a keepsake goes out. */
export function deliveryLine(k: { category?: string | null; release_on?: string | null; release_date?: string | null }) {
  if (k.category === "living" && k.release_date) return `Arrives ${fmtDate(k.release_date)}`;
  if (k.release_on === "date" && k.release_date) return `After I'm gone · on ${fmtDate(k.release_date)}`;
  return "After I'm gone";
}
