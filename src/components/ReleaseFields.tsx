"use client";

import Link from "next/link";
import { useState } from "react";
import { CategoryPicker } from "./CategoryPicker";
import { tomorrowISO, type Category } from "@/lib/keepsake-types";

export function ReleaseFields({
  category: initialCategory,
  releaseOn,
  releaseDate,
  milestones,
}: {
  category: Category;
  releaseOn: string | null;
  releaseDate: string | null;
  milestones: boolean;
}) {
  const [category, setCategory] = useState<Category>(initialCategory);
  const min = tomorrowISO();

  return (
    <div className="flex flex-col gap-4">
      <CategoryPicker value={category} onChange={setCategory} legend="What kind of keepsake is this?" />

      {category === "legacy" ? (
        <fieldset className="flex flex-col gap-2 rounded-2xl bg-cream p-4">
          <legend className="px-1 font-bold">When should it be released?</legend>
          <label className="flex min-h-11 items-center gap-3">
            <input type="radio" name="release_on" value="after_death" defaultChecked={releaseOn !== "date"} className="h-5 w-5" />
            As soon as my release holder confirms
          </label>
          <label className={`flex min-h-11 flex-wrap items-center gap-3 ${milestones ? "" : "opacity-60"}`}>
            <input
              type="radio"
              name="release_on"
              value="date"
              defaultChecked={releaseOn === "date"}
              disabled={!milestones}
              className="h-5 w-5"
            />
            On a special date after I&apos;m gone
            <input
              type="date"
              name="release_date"
              min={min}
              defaultValue={releaseOn === "date" ? releaseDate ?? "" : ""}
              disabled={!milestones}
              className="field w-auto"
              aria-label="Release date after I'm gone"
            />
          </label>
          {!milestones && (
            <p className="text-xs text-muted">
              Birthday and wedding-day messages after you&apos;re gone come with the Plus plan.{" "}
              <Link href="/vault/plan" className="font-bold text-plum underline">See plans</Link>
            </p>
          )}
        </fieldset>
      ) : (
        <fieldset className="flex flex-col gap-2 rounded-2xl bg-cream p-4">
          <legend className="px-1 font-bold">Which day should it arrive?</legend>
          <input type="hidden" name="release_on" value="date" />
          <input
            type="date"
            name="release_date"
            min={min}
            required
            defaultValue={releaseDate ?? ""}
            className="field w-auto"
            aria-label="Delivery date"
          />
          <p className="text-sm text-muted">
            We&apos;ll send it to the people you&apos;ve chosen on that morning. We&apos;ll remind you a week before, and
            you can change the date or cancel it any time until then.
          </p>
        </fieldset>
      )}
    </div>
  );
}
