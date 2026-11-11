import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { gbp } from "@/lib/admin-data";
import { giftFund } from "@/lib/gift";

export const metadata = {
  title: "The KeepNear Gift",
  description:
    "Part of every KeepNear subscription referred by our partners helps local families pay for a goodbye they couldn't otherwise afford. See the pot, and every Gift paid.",
};
export const dynamic = "force-dynamic";

function month(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export default async function GiftPage() {
  let fund: Awaited<ReturnType<typeof giftFund>> | null = null;
  try {
    fund = await giftFund();
  } catch {
    fund = null;
  }
  const paid = (fund?.awards ?? []).filter((a) => a.status === "paid" && a.consent);
  const names = new Map((fund?.partners ?? []).map((p) => [p.id, p.name]));
  const partnerRows = (fund?.partners ?? [])
    .filter((p) => p.active)
    .map((p) => ({ name: p.name, ...(fund?.byPartner[p.id] ?? { added: 0, paid: 0, committed: 0, families: 0 }) }))
    .filter((r) => r.added > 0 || r.families > 0)
    .sort((a, b) => b.paid - a.paid || b.added - a.added);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-plum-dark text-cream">
          <div className="mx-auto max-w-5xl px-4 py-14">
            <p className="font-bold uppercase tracking-wider text-peach">The KeepNear Gift</p>
            <h1 className="mt-2 max-w-3xl text-4xl font-extrabold md:text-5xl">Helping local families say goodbye properly</h1>
            <p className="mt-4 max-w-2xl text-lg text-cream/90">
              A simple funeral now costs around £3,800, and 1 in 7 families struggle to pay. When someone signs up to
              KeepNear through one of our partners, part of what they pay goes into the KeepNear Gift. Our partners
              nominate families who need help, and we pay for the things that make a goodbye feel like theirs.
            </p>

            <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["In the pot today", gbp(Math.max(0, fund?.available ?? 0))],
                ["Families helped", String(fund?.familiesHelped ?? 0)],
                ["Given so far", gbp(fund?.totalPaid ?? 0)],
                ["Added by subscribers", gbp(fund?.totalIn ?? 0)],
              ].map(([l, v]) => (
                <div key={l} className="rounded-2xl bg-cream/10 p-5">
                  <dt className="text-sm font-bold uppercase tracking-wider text-peach">{l}</dt>
                  <dd className="mt-1 text-4xl font-extrabold">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-sm text-cream/70">Live figures, updated as payments arrive and Gifts are paid.</p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12" aria-labelledby="how">
          <h2 id="how" className="text-3xl font-extrabold text-plum">How it works</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              ["Subscribers fund it", "When a partner refers someone to KeepNear, 20% of what they pay in their first year goes into the Gift, then 10% for as long as they stay."],
              ["Partners know who needs help", "Solicitors, funeral directors and hospices see families struggling every week. They nominate them to us."],
              ["We check and approve", "We review each nomination within 5 working days. Gifts are £250 or £500, one per family."],
              ["We pay the bill, not cash", "We pay the florist, venue, mason or funeral director directly. The family doesn't need to be a KeepNear customer."],
            ].map(([t, d], i) => (
              <li key={t} className="card">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-peach font-extrabold text-plum-dark">{i + 1}</span>
                <h3 className="mt-3 font-extrabold text-plum">{t}</h3>
                <p className="mt-1 text-sm">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="bg-white py-12" aria-labelledby="given">
          <div className="mx-auto max-w-5xl px-4">
            <h2 id="given" className="text-3xl font-extrabold text-plum">Every Gift paid</h2>
            <p className="mt-2 text-muted">Families are never named. Each family agreed to this anonymous record.</p>
            {paid.length === 0 ? (
              <p className="card mt-6 text-muted">
                The first Gifts are on their way. Every one will be listed here as soon as it&apos;s paid.
              </p>
            ) : (
              <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
                <table className="w-full min-w-[560px] text-left">
                  <thead className="bg-cream">
                    <tr>
                      <th className="p-3">Month</th>
                      <th className="p-3">Nominated by</th>
                      <th className="p-3">Paid for</th>
                      <th className="p-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paid.map((a) => (
                      <tr key={a.id} className="border-t border-line">
                        <td className="p-3">{month(a.paid_at ?? a.created_at)}</td>
                        <td className="p-3 font-bold">{names.get(a.partner_id ?? "") ?? "A KeepNear partner"}</td>
                        <td className="p-3">{a.pays_for}</td>
                        <td className="p-3">{gbp(a.amount_pence)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {partnerRows.length > 0 && (
          <section className="mx-auto max-w-5xl px-4 py-12" aria-labelledby="partners">
            <h2 id="partners" className="text-3xl font-extrabold text-plum">Our Gift partners</h2>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
              <table className="w-full min-w-[560px] text-left">
                <thead className="bg-cream">
                  <tr>
                    <th className="p-3">Partner</th>
                    <th className="p-3">Their clients added</th>
                    <th className="p-3">Families helped</th>
                    <th className="p-3">Given</th>
                  </tr>
                </thead>
                <tbody>
                  {partnerRows.map((r) => (
                    <tr key={r.name} className="border-t border-line">
                      <td className="p-3 font-bold">{r.name}</td>
                      <td className="p-3">{gbp(r.added)}</td>
                      <td className="p-3">{r.families}</td>
                      <td className="p-3">{gbp(r.paid)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="mx-auto grid max-w-5xl gap-6 px-4 pb-14 md:grid-cols-2" aria-label="Get involved">
          <div className="card">
            <h2 className="text-xl font-extrabold text-plum">Need help with a funeral?</h2>
            <p className="mt-2">
              Ask your solicitor, funeral director or hospice if they&apos;re a KeepNear partner, or{" "}
              <Link href="/directory" className="font-bold text-plum underline">find one near you</Link>. You can also
              email <a href="mailto:info@keepnear.co.uk" className="font-bold text-plum underline">info@keepnear.co.uk</a>{" "}
              and we&apos;ll point you to a partner who can nominate you.
            </p>
          </div>
          <div className="card">
            <h2 className="text-xl font-extrabold text-plum">Are you a funeral director, solicitor or hospice?</h2>
            <p className="mt-2">
              Become a Gift partner. It&apos;s free, and every client you introduce helps families in your community.
            </p>
            <Link href="/partners" className="btn mt-4 inline-block">Partner with us</Link>
          </div>
        </section>

        <p className="mx-auto max-w-5xl px-4 pb-10 text-sm text-muted">
          The KeepNear Gift is run by KeepNear (Ivory Tree Inc Ltd, company no. 14329140) from its own income. It is not a
          registered charity and doesn&apos;t accept donations. Figures on this page come straight from our records.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
