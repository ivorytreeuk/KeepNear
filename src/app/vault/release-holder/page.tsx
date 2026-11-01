import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/VaultHeader";
import { saveReleaseHolder } from "../actions";

export const metadata = { title: "Release holder · KeepNear" };

export default async function ReleaseHolderPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: h } = await supabase.from("release_holders").select("*").maybeSingle();

  return (
    <PageShell>
      <h1 className="text-3xl font-extrabold text-plum">Your release holder</h1>
      <p className="mt-1 max-w-2xl text-muted">
        This is the person who tells us when it&apos;s time to share your keepsakes, usually your solicitor, will
        writer or executor. They can never watch or open anything. Mention KeepNear in your will or letter of wishes
        so they know to contact us.
      </p>

      {sp.error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">
          Please add their name and email.
        </p>
      )}

      <form action={saveReleaseHolder} className="card mt-6 grid max-w-2xl gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 font-bold">
          Their full name
          <input name="full_name" required defaultValue={h?.full_name ?? ""} className="field font-normal" />
        </label>
        <label className="flex flex-col gap-1 font-bold">
          Their role
          <select name="role" defaultValue={h?.role ?? "solicitor"} className="field font-normal">
            <option value="solicitor">Solicitor</option>
            <option value="will_writer">Will writer</option>
            <option value="executor">Executor</option>
            <option value="other">Someone else I trust</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 font-bold sm:col-span-2">
          Firm (if any)
          <input name="firm" defaultValue={h?.firm ?? ""} className="field font-normal" />
        </label>
        <label className="flex flex-col gap-1 font-bold">
          Email
          <input name="email" type="email" required defaultValue={h?.email ?? ""} className="field font-normal" />
        </label>
        <label className="flex flex-col gap-1 font-bold">
          Phone (optional)
          <input name="phone" type="tel" defaultValue={h?.phone ?? ""} className="field font-normal" />
        </label>
        <button type="submit" className="btn self-start">Save release holder</button>
      </form>
    </PageShell>
  );
}
