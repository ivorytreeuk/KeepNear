import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/VaultHeader";
import { PLANS, fmtLimit, getPlan, planRank, type Plan } from "@/lib/plans";

export const metadata = { title: "My plan · KeepNear" };

const MESSAGES: Record<string, string> = {
  success: "Thank you. Your payment went through and your new plan is ready. If it doesn't show yet, refresh in a minute.",
  changed: "Your plan has been changed. Any difference in price is added to, or taken off, your next bill.",
  lifetime: "You're on Lifetime, so there's nothing more to pay.",
};

function Meter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = limit === Infinity ? Math.min(100, used ? 8 : 0) : Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));
  const full = limit !== Infinity && used >= limit;
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="font-bold">{label}</span>
        <span className={full ? "font-bold text-red-800" : "text-muted"}>
          {used} of {fmtLimit(limit)}
        </span>
      </div>
      <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-cream" role="presentation">
        <div className={`h-full rounded-full ${full ? "bg-red-800" : "bg-plum"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function overLimits(plan: Plan, used: { video: number; photo: number; document: number; recipients: number }) {
  const over: string[] = [];
  if (used.video > plan.videos) over.push(`${used.video} videos (${plan.name} allows ${plan.videos})`);
  if (used.photo > plan.photos) over.push(`${used.photo} photos (allows ${plan.photos})`);
  if (used.document > plan.documents) over.push(`${used.document} documents (allows ${plan.documents})`);
  if (used.recipients > plan.recipients) over.push(`${used.recipients} recipients (allows ${fmtLimit(plan.recipients)})`);
  return over;
}

export default async function MyPlanPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: keepsakes }, { count: recipientCount }] = await Promise.all([
    supabase.from("profiles").select("plan, plan_interval, stripe_customer_id").eq("id", user!.id).single(),
    supabase.from("keepsakes").select("kind"),
    supabase.from("recipients").select("id", { count: "exact", head: true }),
  ]);

  const plan = getPlan(profile?.plan);
  const rank = planRank(plan.id);
  const list = keepsakes ?? [];
  const used = {
    video: list.filter((k) => k.kind === "video").length,
    photo: list.filter((k) => k.kind === "photo").length,
    document: list.filter((k) => k.kind === "document").length,
    recipients: recipientCount ?? 0,
  };
  const interval = profile?.plan_interval;
  const billedLine =
    plan.id === "free"
      ? "Free, nothing to pay"
      : plan.id === "lifetime"
        ? "Paid once, for life"
        : interval === "annual"
          ? `${plan.annual} a year`
          : `${plan.monthly} a month`;
  const hasBilling = Boolean(profile?.stripe_customer_id);

  return (
    <PageShell>
      <h1 className="text-3xl font-extrabold text-plum">My plan</h1>

      {sp.billing && MESSAGES[sp.billing] && (
        <p role="status" className="mt-4 rounded-xl bg-white p-3 text-sm">{MESSAGES[sp.billing]}</p>
      )}

      <section className="card mt-6" aria-labelledby="current-h">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Your plan</p>
            <h2 id="current-h" className="text-2xl font-extrabold text-plum">{plan.name}</h2>
            <p className="text-muted">{billedLine}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {plan.id !== "free" && plan.id !== "lifetime" && interval && (
              <form action="/api/checkout" method="post">
                <input type="hidden" name="plan" value={plan.id} />
                <input type="hidden" name="interval" value={interval === "annual" ? "monthly" : "annual"} />
                <button type="submit" className="btn-outline">
                  {interval === "annual" ? `Switch to ${plan.monthly}/month` : `Switch to yearly, ${plan.annual} (2 months free)`}
                </button>
              </form>
            )}
            {hasBilling && plan.id !== "free" && (
              <form action="/api/billing-portal" method="post">
                <button type="submit" className="btn-outline">Card, invoices and cancelling</button>
              </form>
            )}
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Meter label="Videos" used={used.video} limit={plan.videos} />
          <Meter label="Photos" used={used.photo} limit={plan.photos} />
          <Meter label="Documents" used={used.document} limit={plan.documents} />
          <Meter label="Recipients" used={used.recipients} limit={plan.recipients} />
        </div>
        <p className="mt-4 text-sm text-muted">
          Videos up to {plan.videoMinutes} minutes each.{" "}
          {plan.milestones ? "Birthday and milestone messages included." : "Birthday and milestone messages come with Plus and above."}
        </p>
      </section>

      {plan.id === "lifetime" ? (
        <p className="card mt-6">You have the biggest plan we offer, for life. There&apos;s nothing to upgrade.</p>
      ) : (
        <section className="mt-10" aria-labelledby="change-h">
          <h2 id="change-h" className="text-xl font-extrabold text-plum">Change your plan</h2>
          <p className="mt-1 text-sm text-muted">
            Moving up takes effect straight away and you pay the difference for the rest of this period. Moving down is
            credited against your next bill. Your keepsakes are never deleted when you change plan.
          </p>

          <ul className="mt-4 flex flex-col gap-3">
            {PLANS.filter((p) => p.id !== plan.id).map((p) => {
              const up = planRank(p.id) > rank;
              const over = up ? [] : overLimits(p, used);
              return (
                <li key={p.id} className={`card ${up && planRank(p.id) === rank + 1 ? "border-2 border-plum" : ""}`}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-extrabold text-plum">{p.name}</h3>
                        {up && planRank(p.id) === rank + 1 && (
                          <span className="rounded-full bg-peach px-3 py-1 text-xs font-extrabold text-plum-dark">Next step up</span>
                        )}
                      </div>
                      <p className="text-sm text-muted">
                        {p.oneOff ?? (p.id === "free" ? "Free" : `${p.monthly} a month or ${p.annual} a year`)}
                      </p>
                      <p className="mt-1 text-sm">
                        {p.videos} videos (up to {p.videoMinutes} min) · {p.photos} photos · {p.documents} documents ·{" "}
                        {fmtLimit(p.recipients)} recipients
                      </p>
                      {over.length > 0 && (
                        <p className="mt-2 rounded-xl bg-cream p-3 text-sm">
                          You currently have {over.join(", ")}. Everything stays safe and will still be released, but you
                          won&apos;t be able to add more of those until you&apos;re under the limit.
                        </p>
                      )}
                    </div>

                    <div className="flex w-full flex-col gap-2 sm:w-auto">
                      {p.id === "free" ? (
                        hasBilling ? (
                          <form action="/api/billing-portal" method="post">
                            <button type="submit" className="btn-outline w-full">Cancel and move to Free</button>
                          </form>
                        ) : null
                      ) : p.id === "lifetime" ? (
                        <form action="/api/checkout" method="post">
                          <input type="hidden" name="plan" value="lifetime" />
                          <button type="submit" className="btn w-full">Upgrade for {p.oneOff}</button>
                        </form>
                      ) : (
                        <>
                          <form action="/api/checkout" method="post">
                            <input type="hidden" name="plan" value={p.id} />
                            <input type="hidden" name="interval" value="monthly" />
                            <button type="submit" className={`${up ? "btn" : "btn-outline"} w-full`}>
                              {up ? "Upgrade" : "Downgrade"} · {p.monthly}/month
                            </button>
                          </form>
                          <form action="/api/checkout" method="post">
                            <input type="hidden" name="plan" value={p.id} />
                            <input type="hidden" name="interval" value="annual" />
                            <button type="submit" className="btn-outline w-full">
                              {up ? "Upgrade" : "Downgrade"} · {p.annual}/year
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <p className="mt-8 text-sm text-muted">
        If you cancel, your vault is frozen, never deleted, and still released when the time comes.{" "}
        <Link href="/legal/terms" className="font-bold text-plum underline">Read the terms</Link>
      </p>
    </PageShell>
  );
}
