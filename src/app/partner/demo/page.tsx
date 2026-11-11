import Link from "next/link";
import { Logo } from "@/components/Logo";
import { PartnerView } from "@/components/PartnerView";
import type { PartnerStats } from "@/lib/admin-data";

export const metadata = {
  title: "Partner dashboard example · KeepNear",
  description: "An example of the dashboard every KeepNear partner gets.",
};

function lastSixMonths() {
  const out: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    out.push(d.toISOString().slice(0, 7));
  }
  return out;
}

// Illustrative figures only, for a mid-sized firm a few months in.
const MONTHS = lastSixMonths();
const SHAPE = [
  { clicks: 18, visits: 42, signups: 12, revenuePence: 16779 },
  { clicks: 24, visits: 57, signups: 16, revenuePence: 46116 },
  { clicks: 30, visits: 78, signups: 24, revenuePence: 76895 },
  { clicks: 36, visits: 93, signups: 28, revenuePence: 110474 },
  { clicks: 44, visits: 114, signups: 36, revenuePence: 151053 },
  { clicks: 54, visits: 132, signups: 44, revenuePence: 198618 },
];
const monthly = MONTHS.map((month, i) => ({ month, ...SHAPE[i], sharePence: Math.round(SHAPE[i].revenuePence * 0.2) }));
const sum = (k: "clicks" | "visits" | "signups" | "revenuePence") => monthly.reduce((t, m) => t + m[k], 0);

const STATS: PartnerStats = {
  views: 2960,
  views30: 640,
  clicks: sum("clicks"),
  clicks30: 54,
  visits: sum("visits"),
  visits30: 132,
  signups: sum("signups"),
  paying: 124,
  revenuePence: sum("revenuePence"),
  commissionPence: Math.round(sum("revenuePence") * 0.2),
  monthly,
};

export default async function PartnerDemo({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const commission = sp.type === "commission";
  const iso = (m: number) => new Date(Date.now() - m * 30 * 86400000).toISOString();
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Logo size={28} />
            <span className="rounded-full bg-cream px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-plum">Partner</span>
          </div>
          <Link href="/partners" className="text-sm font-bold text-plum underline">About partnering</Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div role="note" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-plum p-4 text-cream">
          <div>
            <p>
              <strong>Example dashboard.</strong> A fictional firm with illustrative figures, to show what partners see.
            </p>
            <p className="mt-1 text-sm">
              {commission ? (
                <>Commission version. <Link href="/partner/demo" className="font-bold underline">See the KeepNear Gift version</Link></>
              ) : (
                <>KeepNear Gift version. <Link href="/partner/demo?type=commission" className="font-bold underline">See the commission version</Link></>
              )}
            </p>
          </div>
          <Link href="/partner/signup" className="rounded-full bg-peach px-4 py-2 text-sm font-extrabold text-plum-dark">Register as a partner</Link>
        </div>
        <PartnerView
          p={{
            id: "demo",
            slug: commission ? "hartwell" : "harper-and-lane",
            name: commission ? "Hartwell Financial Planning (example)" : "Harper & Lane Solicitors (example)",
            type: commission ? "financial_adviser" : "solicitor",
            commission_rate: 20,
            active: true,
            reference: "KNP-H4RP3L",
            source: "admin",
            promo_code: commission ? "HARTWELL25" : "HARPER25",
            reward: commission ? "commission" : "gift",
          }}
          s={STATS}
          demo
          gift={
            commission
              ? undefined
              : {
                  partnerId: "demo",
                  added: STATS.commissionPence,
                  paid: 75000,
                  committed: 25000,
                  potAvailable: 412000,
                  paysFor: [],
                  awards: [
                    { id: "a3", family_label: "J. M.", pays_for: "Headstone or memorial", amount_pence: 25000, status: "approved", created_at: iso(0.3) },
                    { id: "a2", family_label: "Sarah", pays_for: "Wake or venue", amount_pence: 50000, status: "paid", created_at: iso(1.5) },
                    { id: "a1", family_label: "The Okafor family", pays_for: "Flowers", amount_pence: 25000, status: "paid", created_at: iso(3) },
                  ],
                }
          }
        />
      </main>
    </div>
  );
}
