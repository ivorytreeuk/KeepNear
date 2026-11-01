import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/VaultHeader";
import { addRecipient, removeRecipient } from "../actions";
import { fmtLimit, getPlan } from "@/lib/plans";

export const metadata = { title: "Recipients · KeepNear" };

export default async function RecipientsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [{ data: recipients }, { data: profile }] = await Promise.all([
    supabase.from("recipients").select("id, full_name, email, relationship").order("created_at"),
    supabase.from("profiles").select("plan").eq("id", user!.id).single(),
  ]);
  const plan = getPlan(profile?.plan);
  const list = recipients ?? [];
  const full = list.length >= plan.recipients;

  return (
    <PageShell>
      <h1 className="text-3xl font-extrabold text-plum">Recipients</h1>
      <p className="mt-1 text-muted">
        The people your keepsakes are for. {list.length} of {fmtLimit(plan.recipients)} on your {plan.name} plan.
      </p>

      {sp.error === "limit" && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">
          Your plan is full. <Link href="/pricing" className="font-bold underline">Upgrade</Link> to add more people.
        </p>
      )}
      {sp.error === "name" && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">Please enter their name.</p>
      )}

      <ul className="mt-6 flex flex-col gap-3">
        {list.map((r) => (
          <li key={r.id} className="card flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-bold">{r.full_name}</p>
              <p className="text-sm text-muted">{[r.relationship, r.email].filter(Boolean).join(" · ") || "No details yet"}</p>
            </div>
            <form action={removeRecipient}>
              <input type="hidden" name="id" value={r.id} />
              <button type="submit" className="min-h-11 rounded-full px-3 text-sm font-bold text-red-800 hover:bg-red-50">
                Remove
              </button>
            </form>
          </li>
        ))}
      </ul>

      {!full && (
        <form action={addRecipient} className="card mt-6 grid gap-4 sm:grid-cols-2">
          <h2 className="text-lg font-extrabold text-plum sm:col-span-2">Add someone</h2>
          <label className="flex flex-col gap-1 font-bold">
            Full name
            <input name="full_name" required maxLength={120} className="field font-normal" />
          </label>
          <label className="flex flex-col gap-1 font-bold">
            Relationship (optional)
            <input name="relationship" placeholder="Daughter, best friend…" maxLength={60} className="field font-normal" />
          </label>
          <label className="flex flex-col gap-1 font-bold sm:col-span-2">
            Email (optional, they won&apos;t hear from us until release)
            <input name="email" type="email" className="field font-normal" />
          </label>
          <button type="submit" className="btn self-start">Add recipient</button>
        </form>
      )}
    </PageShell>
  );
}
