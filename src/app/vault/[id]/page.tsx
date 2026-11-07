import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/VaultHeader";
import { ProtectedMedia } from "@/components/ProtectedMedia";
import { deleteKeepsake, saveKeepsakeSettings } from "../actions";
import { getPlan } from "@/lib/plans";
import { ReleaseFields } from "@/components/ReleaseFields";
import { asCategory } from "@/lib/keepsake-types";

export const metadata = { title: "Keepsake · KeepNear" };

export default async function KeepsakePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: k } = await supabase.from("keepsakes").select("*").eq("id", id).maybeSingle();
  if (!k) notFound();

  const [{ data: signed }, { data: recipients }, { data: links }, { data: profile }] = await Promise.all([
    supabase.storage.from("vault").createSignedUrl(k.storage_path, 60 * 10),
    supabase.from("recipients").select("id, full_name, relationship, email").order("full_name"),
    supabase.from("keepsake_recipients").select("recipient_id").eq("keepsake_id", id),
    supabase.from("profiles").select("plan").eq("id", user!.id).single(),
  ]);
  const plan = getPlan(profile?.plan);
  const chosen = new Set((links ?? []).map((l) => l.recipient_id));

  return (
    <PageShell>
      <Link href="/vault" className="text-sm font-bold text-plum underline">← Back to vault</Link>
      {sp.new && (
        <p role="status" className="mt-4 rounded-xl bg-white p-3 text-sm">
          Saved safely to your vault. Now choose who it&apos;s for{sp.type === "living" ? " and the day it should arrive" : ""}.
        </p>
      )}
      {sp.saved && <p role="status" className="mt-4 rounded-xl bg-white p-3 text-sm">Changes saved.</p>}
      {sp.error === "date" && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">
          Please choose a delivery date in the future for a &ldquo;While I&apos;m alive&rdquo; keepsake.
        </p>
      )}

      {sp.error === "contact" && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">
          A time capsule needs at least one person with an email address, so we can deliver it on the day. Tick
          someone below, or{" "}
          <Link href="/vault/recipients" className="font-bold underline">add an email to a recipient</Link>.
        </p>
      )}

      <h1 className="mt-3 text-3xl font-extrabold text-plum">{k.title}</h1>
      <p className="mt-1 text-sm text-muted">
        Added {new Date(k.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
      </p>

      <div className="mt-6">
        {signed?.signedUrl ? (
          <ProtectedMedia kind={k.kind} url={signed.signedUrl} title={k.title} />
        ) : (
          <p className="card">This file isn&apos;t available. It may not have finished saving.</p>
        )}
      </div>

      <form action={saveKeepsakeSettings} className="card mt-6 flex flex-col gap-5">
        <input type="hidden" name="id" value={k.id} />

        <label className="flex flex-col gap-1 font-bold">
          Title
          <input name="title" defaultValue={k.title} maxLength={120} className="field font-normal" required />
        </label>

        <label className="flex flex-col gap-1 font-bold">
          A note to go with it (optional)
          <textarea name="note" defaultValue={k.note ?? ""} rows={3} maxLength={1000} className="field font-normal" />
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="font-bold">Who is it for?</legend>
          {(recipients ?? []).length === 0 ? (
            <p className="text-sm text-muted">
              You haven&apos;t added anyone yet.{" "}
              <Link href="/vault/recipients" className="font-bold text-plum underline">Add a recipient</Link>
            </p>
          ) : (
            (recipients ?? []).map((r) => (
              <label key={r.id} className="flex min-h-11 items-center gap-3 rounded-xl border border-line px-3">
                <input type="checkbox" name="recipients" value={r.id} defaultChecked={chosen.has(r.id)} className="h-5 w-5" />
                <span>
                  {r.full_name}
                  {r.relationship && <span className="text-muted"> · {r.relationship}</span>}
                  {!r.email && <span className="text-sm text-muted"> · no email yet</span>}
                </span>
              </label>
            ))
          )}
        </fieldset>

        <ReleaseFields
          category={sp.type === "living" ? "living" : asCategory(k.category)}
          releaseOn={k.release_on}
          releaseDate={k.release_date}
          milestones={plan.milestones}
        />

        <button type="submit" className="btn self-start">Save changes</button>
      </form>

      <form action={deleteKeepsake} className="mt-8">
        <input type="hidden" name="id" value={k.id} />
        <details className="card">
          <summary className="cursor-pointer font-bold text-red-800">Delete this keepsake</summary>
          <p className="mt-2 text-sm">This removes it from your vault for good. Nobody will receive it.</p>
          <button type="submit" className="mt-3 inline-flex min-h-11 items-center rounded-full bg-red-800 px-5 font-bold text-white">
            Yes, delete it permanently
          </button>
        </details>
      </form>
    </PageShell>
  );
}
