import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/VaultHeader";
import { LogoMark } from "@/components/Logo";
import { NextPlanCard } from "@/components/NextPlanCard";
import { fmtDate } from "@/lib/keepsake-types";

export const metadata = { title: "Saved · KeepNear" };

const KIND = { video: "message", photo: "photo", document: "document" } as const;

export default async function SavedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: k }, { data: links }, { data: profile }, { data: holder }] = await Promise.all([
    supabase.from("keepsakes").select("id, kind, title, category, release_on, release_date").eq("id", id).maybeSingle(),
    supabase.from("keepsake_recipients").select("recipients(full_name)").eq("keepsake_id", id),
    supabase.from("profiles").select("plan").eq("id", user!.id).single(),
    supabase.from("release_holders").select("full_name").maybeSingle(),
  ]);
  if (!k) notFound();

  const names = (links ?? [])
    .map((l) => (l.recipients as unknown as { full_name: string } | null)?.full_name)
    .filter(Boolean) as string[];
  const forWhom =
    names.length === 0
      ? null
      : names.length === 1
        ? names[0]
        : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  const living = k.category === "living";
  const when =
    living && k.release_date
      ? `on ${fmtDate(k.release_date)}`
      : k.release_on === "date" && k.release_date
        ? `on ${fmtDate(k.release_date)}, after you're gone`
        : "when the time comes";
  const kindWord = KIND[k.kind as keyof typeof KIND] ?? "keepsake";

  return (
    <PageShell>
      <section className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-white shadow-sm">
          <LogoMark size={64} />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold text-plum md:text-4xl">That&apos;s one kept safe.</h1>
        <p className="mt-3 text-lg">
          <strong>&ldquo;{k.title}&rdquo;</strong> is locked in your vault.
          {forWhom ? (
            <> Only {forWhom} will ever see this {kindWord}, {when}.</>
          ) : (
            <> Add who it&apos;s for, and only they will ever see it.</>
          )}
        </p>
        <p className="mt-2 text-muted">Not many people get round to saying these things. You just did.</p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/vault/record" className="btn">Record another</Link>
          <Link href="/vault" className="btn-outline">Back to my vault</Link>
          {!forWhom && (
            <Link href={`/vault/${k.id}`} className="btn-outline">Choose who it&apos;s for</Link>
          )}
        </div>

        {!holder && !living && (
          <p className="mt-6 rounded-xl bg-white p-3 text-sm">
            One more thing: nobody can release your keepsakes until you add a release holder.{" "}
            <Link href="/vault/release-holder" className="font-bold text-plum underline">Add one now</Link>
          </p>
        )}
      </section>

      <div className="mx-auto mt-10 max-w-2xl">
        <NextPlanCard currentPlanId={profile?.plan} />
      </div>
    </PageShell>
  );
}
