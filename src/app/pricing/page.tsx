import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { PlanButtons } from "@/components/PlanButtons";
import { PLANS, fmtLimit, getPlan } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Pricing · KeepNear" };

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let current: string | null = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
    current = getPlan(data?.plan).id;
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-4xl font-extrabold text-plum">Simple plans, small steps</h1>
        <p className="mt-2 max-w-2xl text-lg">
          Start free with one video. Every plan includes secure release on death, and your vault is never deleted if
          you stop paying.
        </p>

        {sp.soon && (
          <p role="status" className="mt-6 rounded-xl bg-white p-4">
            Payments open very soon. Thanks for your patience, and you&apos;ll keep everything you&apos;ve recorded.
          </p>
        )}
        {sp.cancelled && (
          <p role="status" className="mt-6 rounded-xl bg-white p-4">No payment was taken. You can pick a plan any time.</p>
        )}

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((p) => {
            const isCurrent = current === p.id;
            return (
              <li key={p.id} className={`card flex flex-col ${p.id === "plus" ? "border-2 border-plum" : ""}`}>
                <div className="mb-2 flex min-h-7 flex-wrap gap-2">
                  {p.id === "plus" && (
                    <span className="rounded-full bg-peach px-3 py-1 text-xs font-extrabold text-plum-dark">Most popular</span>
                  )}
                  {isCurrent && (
                    <span className="rounded-full bg-plum px-3 py-1 text-xs font-extrabold text-cream">Your plan</span>
                  )}
                </div>
                <h2 className="text-xl font-extrabold text-plum">{p.name}</h2>
                <p className="mt-2">
                  {p.oneOff ? (
                    <span className="text-3xl font-extrabold">{p.oneOff}</span>
                  ) : (
                    <>
                      <span className="text-3xl font-extrabold">{p.monthly}</span>
                      <span className="text-muted"> /month</span>
                      {p.id !== "free" && <span className="block text-sm text-muted">or {p.annual} a year</span>}
                    </>
                  )}
                </p>
                <ul className="mt-4 mb-5 flex flex-1 flex-col gap-1 text-sm">
                  <li>{p.videos} video{p.videos === 1 ? "" : "s"}, up to {p.videoMinutes} min each</li>
                  <li>{p.photos} photos</li>
                  <li>{p.documents} document{p.documents === 1 ? "" : "s"}</li>
                  <li>{fmtLimit(p.recipients)} recipient{p.recipients === 1 ? "" : "s"}</li>
                  <li>{p.milestones ? "Birthday and milestone messages" : "Released after death"}</li>
                  {p.id === "lifetime" && <li>Pay once, never again</li>}
                </ul>
                {isCurrent ? (
                  <p className="rounded-full border border-line py-3 text-center text-sm font-bold text-muted">
                    You&apos;re on this plan
                  </p>
                ) : (
                  <PlanButtons plan={p} loggedIn={Boolean(user)} primary={p.id === "plus"} />
                )}
              </li>
            );
          })}
        </ul>
        <p className="mt-6 text-sm text-muted">
          Pay by card, Apple Pay, Google Pay or PayPal. Cancel any time from Settings. Prices in GBP.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
