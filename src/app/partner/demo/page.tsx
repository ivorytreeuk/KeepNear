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
  { clicks: 9, visits: 14, signups: 3, revenuePence: 2397 },
  { clicks: 12, visits: 19, signups: 4, revenuePence: 6588 },
  { clicks: 15, visits: 26, signups: 6, revenuePence: 10985 },
  { clicks: 18, visits: 31, signups: 7, revenuePence: 15782 },
  { clicks: 22, visits: 38, signups: 9, revenuePence: 21579 },
  { clicks: 27, visits: 44, signups: 11, revenuePence: 28374 },
];
const monthly = MONTHS.map((month, i) => ({ month, ...SHAPE[i] }));
const sum = (k: "clicks" | "visits" | "signups" | "revenuePence") => monthly.reduce((t, m) => t + m[k], 0);

const STATS: PartnerStats = {
  views: 1184,
  views30: 263,
  clicks: sum("clicks"),
  clicks30: 27,
  visits: sum("visits"),
  visits30: 44,
  signups: sum("signups"),
  paying: 31,
  revenuePence: sum("revenuePence"),
  commissionPence: Math.round(sum("revenuePence") * 0.2),
  monthly,
};

export default function PartnerDemo() {
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
          <p>
            <strong>Example dashboard.</strong> A fictional firm with illustrative figures, to show what partners see.
          </p>
          <Link href="/partner/signup" className="rounded-full bg-peach px-4 py-2 text-sm font-extrabold text-plum-dark">Register as a partner</Link>
        </div>
        <PartnerView
          p={{
            id: "demo",
            slug: "harper-and-lane",
            name: "Harper & Lane Solicitors (example)",
            type: "solicitor",
            commission_rate: 20,
            active: true,
            reference: "KNP-H4RP3L",
            source: "admin",
            promo_code: "HARPER25",
          }}
          s={STATS}
        />
      </main>
    </div>
  );
}
