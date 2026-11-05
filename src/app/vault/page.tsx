import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/VaultHeader";
import { fmtLimit, getPlan } from "@/lib/plans";

export const metadata = { title: "Your vault · KeepNear" };

const KIND_LABEL = { video: "Video", photo: "Photo", document: "Document" } as const;

export default async function VaultPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: keepsakes }, { data: holder }] = await Promise.all([
    supabase.from("profiles").select("full_name, plan").eq("id", user!.id).single(),
    supabase
      .from("keepsakes")
      .select("id, kind, title, created_at, status, release_on, release_date, keepsake_recipients(count)")
      .order("created_at", { ascending: false }),
    supabase.from("release_holders").select("full_name, firm").maybeSingle(),
  ]);

  const plan = getPlan(profile?.plan);
  const hasMfa = (user!.factors ?? []).some((f) => f.status === "verified");
  let hasPasskey = false;
  try {
    const { data: pk } = await supabase.auth.passkey.list();
    hasPasskey = (pk ?? []).length > 0;
  } catch {
    hasPasskey = false;
  }
  const secured = hasMfa || hasPasskey;
  const list = keepsakes ?? [];
  const used = {
    video: list.filter((k) => k.kind === "video").length,
    photo: list.filter((k) => k.kind === "photo").length,
    document: list.filter((k) => k.kind === "document").length,
  };
  const firstName = profile?.full_name?.split(" ")[0];

  return (
    <PageShell>
      {sp.deleted && <p role="status" className="mb-4 rounded-xl bg-white p-3 text-sm">Keepsake deleted.</p>}
      {sp.holder && <p role="status" className="mb-4 rounded-xl bg-white p-3 text-sm">Release holder saved.</p>}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-plum">{firstName ? `Hi ${firstName}` : "Your vault"}</h1>
          <p className="mt-1 text-muted">
            {plan.name} plan · {used.video}/{fmtLimit(plan.videos)} videos · {used.photo}/{fmtLimit(plan.photos)} photos ·{" "}
            {used.document}/{fmtLimit(plan.documents)} documents
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/vault/record" className="btn">Record a video</Link>
          <Link href="/vault/upload" className="btn-outline">Add photo or document</Link>
        </div>
      </div>

      {!secured && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-plum p-4 text-cream">
          <div>
            <p className="font-bold">Lock your vault properly</p>
            <p className="text-sm opacity-90">Add a passkey or two-step verification. It takes about a minute.</p>
          </div>
          <Link href="/vault/settings#security" className="inline-flex min-h-11 items-center rounded-full bg-cream px-5 font-bold text-plum">
            Secure my vault
          </Link>
        </div>
      )}

      {!holder && (
        <div className="mt-6 rounded-2xl border border-peach bg-white p-4">
          <p className="font-bold text-plum">Nobody can release your keepsakes yet</p>
          <p className="mt-1 text-sm">
            Add your solicitor, will writer or executor. They can&apos;t watch anything, but they&apos;re the person who
            tells us when it&apos;s time to share.
          </p>
          <Link href="/vault/release-holder" className="mt-3 inline-block font-bold text-plum underline">
            Add a release holder
          </Link>
        </div>
      )}

      <section className="mt-8" aria-labelledby="ks-heading">
        <h2 id="ks-heading" className="text-xl font-extrabold text-plum">Your keepsakes</h2>
        {list.length === 0 ? (
          <div className="card mt-3 text-center">
            <p className="font-bold">Nothing here yet.</p>
            <p className="mt-1 text-sm text-muted">
              Start with something small: a two-minute message to someone you love.
            </p>
          </div>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {list.map((k) => {
              const recipients =
                (k.keepsake_recipients as unknown as { count: number }[] | null)?.[0]?.count ?? 0;
              return (
                <li key={k.id}>
                  <Link href={`/vault/${k.id}`} className="card block hover:border-plum">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">
                      {KIND_LABEL[k.kind as keyof typeof KIND_LABEL]}
                      {k.status !== "ready" && " · not finished saving"}
                    </span>
                    <span className="mt-1 block text-lg font-bold">{k.title}</span>
                    <span className="mt-1 block text-sm text-muted">
                      {recipients === 0 ? "No recipients yet" : `For ${recipients} ${recipients === 1 ? "person" : "people"}`}
                      {" · "}
                      {k.release_on === "date" && k.release_date
                        ? `Released ${new Date(k.release_date).toLocaleDateString("en-GB")}`
                        : "Released after death"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="mt-10 text-sm text-muted">
        Need more space? <Link href="/pricing" className="font-bold text-plum underline">See plans</Link>
      </p>
    </PageShell>
  );
}
