import { PARTNER_TYPES, gbp, type PartnerStats } from "@/lib/admin-data";
import { GiftPanel, type GiftPanelData } from "./GiftPanel";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://keepnear.co.uk").replace(/\/$/, "");

export type PartnerViewData = {
  id: string;
  slug: string;
  name: string;
  type: string;
  commission_rate: number;
  active: boolean;
  reference: string | null;
  source: string | null;
  promo_code?: string | null;
  reward?: string | null;
};

function monthName(m: string) {
  return new Date(`${m}-01T00:00:00`).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export const PARTNER_OFFER = "25% off the Family plan for the first year";

export function PartnerView({ p, s, gift, demo }: { p: PartnerViewData; s: PartnerStats; gift?: GiftPanelData; demo?: boolean }) {
  const isGift = (p.reward ?? "gift") === "gift";
  const tiles: [string, string | number, string][] = [
    ["Seen in our directory", s.views, `${s.views30} in the last 30 days`],
    ["Clicks to your website", s.clicks, `${s.clicks30} in the last 30 days`],
    ["Visits from your link", s.visits, `${s.visits30} in the last 30 days`],
    ["Clients who signed up", s.signups, `${s.paying} on a paid plan`],
    ["Revenue from your clients", gbp(s.revenuePence), "Payments received by KeepNear"],
    isGift
      ? ["Added to the KeepNear Gift", gbp(s.commissionPence), "20% in year one, then 10%"]
      : ["Your earnings", gbp(s.commissionPence), `${Number(p.commission_rate)}% for 24 months`],
  ];
  return (
    <section className="flex flex-col gap-6" aria-labelledby={`p-${p.id}`}>
      <div>
        <h1 id={`p-${p.id}`} className="text-3xl font-extrabold text-plum">{p.name}</h1>
        <p className="text-muted">
          {PARTNER_TYPES[p.type]} · {p.active ? "Listed in the KeepNear directory" : "Not currently listed in the directory"}
        </p>
        {p.reference && (
          <p className="mt-3 inline-block rounded-xl border-2 border-peach bg-cream px-4 py-2 text-sm">
            Partner reference: <strong className="font-mono text-base tracking-widest text-plum">{p.reference}</strong>
          </p>
        )}
      </div>

      {!p.active && p.source === "signup" && (
        <p role="status" className="rounded-2xl bg-white p-4 text-sm">
          <strong>Thanks for registering.</strong> We&apos;re checking your details and will add you to our
          directory, usually within two working days. Your referral link below works now.
        </p>
      )}

      <div className="card">
        <h2 className="text-lg font-extrabold text-plum">Your referral link</h2>
        <p className="mt-1 text-sm text-muted">
          Share this with clients (in emails, will packs, your website). Anyone who signs up within 90 days
          of clicking it is credited to you.
        </p>
        <p className="mt-3 break-all rounded-xl bg-cream p-3 font-mono text-sm">{SITE}/r/{p.slug}</p>
        <p className="mt-2 text-sm text-muted">
          To send people straight to sign-up: <span className="break-all font-mono">{SITE}/r/{p.slug}?to=signup</span>
        </p>
      </div>

      <div className="card border-t-4 border-t-peach">
        <h2 className="text-lg font-extrabold text-plum">Your clients&apos; discount code</h2>
        {p.promo_code ? (
          <>
            <p className="mt-3 inline-block rounded-xl bg-cream px-4 py-2 font-mono text-2xl font-extrabold tracking-widest text-plum">{p.promo_code}</p>
            <p className="mt-2 text-sm text-muted">
              {PARTNER_OFFER}. Clients enter it at checkout. Anyone who uses it is credited to you, even if they
              didn&apos;t click your link.
            </p>
          </>
        ) : (
          <p className="mt-1 text-sm text-muted">
            We&apos;re setting up your code ({PARTNER_OFFER.toLowerCase()}). It will appear here shortly.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map(([label, value, sub]) => (
          <div key={label} className="card">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">{label}</p>
            <p className="mt-1 text-3xl font-extrabold text-plum">{value}</p>
            <p className="text-sm text-muted">{sub}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <caption className="p-3 text-left font-extrabold text-plum">Last six months</caption>
          <thead className="bg-cream">
            <tr>
              <th className="p-3">Month</th>
              <th className="p-3">Clicks to you</th>
              <th className="p-3">Visits from you</th>
              <th className="p-3">Sign-ups</th>
              <th className="p-3">Revenue</th>
              <th className="p-3">{isGift ? "To the Gift" : "Your earnings"}</th>
            </tr>
          </thead>
          <tbody>
            {s.monthly.slice().reverse().map((m) => (
              <tr key={m.month} className="border-t border-line">
                <td className="p-3 font-bold">{monthName(m.month)}</td>
                <td className="p-3">{m.clicks}</td>
                <td className="p-3">{m.visits}</td>
                <td className="p-3">{m.signups}</td>
                <td className="p-3">{gbp(m.revenuePence)}</td>
                <td className="p-3">{gbp(m.sharePence)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isGift && gift && <GiftPanel data={gift} demo={demo} />}

      <p className="text-sm text-muted">
        {isGift
          ? "Your share goes into the KeepNear Gift, never to your firm. "
          : "Earnings are paid quarterly once they reach £50, for 24 months from each client's sign-up. "}
        For privacy, we never share the names or details of
        your clients&apos; KeepNear accounts. Questions? Email{" "}
        <a href="mailto:info@keepnear.co.uk" className="font-bold text-plum underline">info@keepnear.co.uk</a>.
      </p>
    </section>
  );
}
