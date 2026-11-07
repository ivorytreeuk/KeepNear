"use client";

import { CATEGORIES, type Category } from "@/lib/keepsake-types";

/** Two large choices: a keepsake for after death, or a time capsule delivered while alive. */
export function CategoryPicker({
  value,
  onChange,
  name = "category",
  legend = "Is this for after you're gone, or for while you're alive?",
}: {
  value: Category;
  onChange: (c: Category) => void;
  name?: string;
  legend?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 font-bold">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {CATEGORIES.map((c) => {
          const on = value === c.id;
          return (
            <label
              key={c.id}
              className={`flex cursor-pointer gap-3 rounded-2xl border-2 p-3 ${on ? "border-plum bg-white" : "border-line bg-white/60"}`}
            >
              <input
                type="radio"
                name={name}
                value={c.id}
                checked={on}
                onChange={() => onChange(c.id)}
                className="mt-1 h-5 w-5 shrink-0"
              />
              <span>
                <span className="block font-bold text-plum">{c.label}</span>
                <span className="block text-sm text-muted">{c.body}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
