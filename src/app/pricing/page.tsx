import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { PLANS, fmtLimit } from "@/lib/plans";

export const metadata = { title: "Pricing · KeepNear" };

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-4xl font-extrabold text-plum">Simple plans, small steps</h1>
        <p className="mt-2 max-w-2xl text-lg">
          Start free with one video. Every plan includes secure release on death, and your vault is never deleted if
          you stop paying.
        </p>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((p) => (
            <li key={p.id} className={`card flex flex-col ${p.id === "plus" ? "border-2 border-plum" : ""}`}>
              {p.id === "plus" && (
                <span className="mb-2 self-start rounded-full bg-peach px-3 py-1 text-xs font-extrabold text-plum-dark">
                  Most popular
                </span>
              )}
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
              <ul className="mt-4 flex flex-1 flex-col gap-1 text-sm">
                <li>{p.videos} video{p.videos === 1 ? "" : "s"}, up to {p.videoMinutes} min each</li>
                <li>{p.photos} photos</li>
                <li>{p.documents} document{p.documents === 1 ? "" : "s"}</li>
                <li>{fmtLimit(p.recipients)} recipient{p.recipients === 1 ? "" : "s"}</li>
                <li>{p.milestones ? "Birthday and milestone messages" : "Released after death"}</li>
              </ul>
              <Link href="/signup" className={p.id === "plus" ? "btn mt-5" : "btn-outline mt-5"}>
                {p.id === "free" ? "Start free" : `Choose ${p.name}`}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted">Prices include VAT where applicable. Paid plans open soon.</p>
      </main>
      <SiteFooter />
    </>
  );
}
