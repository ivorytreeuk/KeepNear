import Link from "next/link";
import { gbp } from "@/lib/admin-data";
import { nominateFamily } from "@/app/partner/actions";

export type GiftPanelData = {
  partnerId: string;
  added: number;
  paid: number;
  committed: number;
  potAvailable: number;
  awards: { id: string; family_label: string; pays_for: string; amount_pence: number; status: string; created_at: string }[];
  paysFor: string[];
  notice?: string;
};

const STATUS: Record<string, string> = {
  pending: "Waiting for review",
  approved: "Approved, payment on its way",
  paid: "Paid",
  declined: "Not approved",
};

export function GiftPanel({ data, demo }: { data: GiftPanelData; demo?: boolean }) {
  const yours = data.added - data.paid - data.committed;
  return (
    <section className="card flex flex-col gap-5 border-t-4 border-t-peach" aria-labelledby="gift-h">
      <div>
        <h2 id="gift-h" className="text-2xl font-extrabold text-plum">The KeepNear Gift</h2>
        <p className="mt-1 text-muted">
          Your clients&apos; payments help local families pay for a goodbye they couldn&apos;t otherwise afford. Every
          £250 your clients add unlocks a £250 Gift you can award.{" "}
          <Link href="/gift" className="font-bold text-plum underline">How it works</Link>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Your clients have added", gbp(data.added)],
          ["You've awarded", gbp(data.paid + data.committed)],
          ["Yours to award now", gbp(Math.max(0, yours))],
          ["Whole Gift pot today", gbp(Math.max(0, data.potAvailable))],
        ].map(([l, v]) => (
          <div key={l} className="rounded-2xl bg-cream p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">{l}</p>
            <p className="mt-1 text-2xl font-extrabold text-plum">{v}</p>
          </div>
        ))}
      </div>

      {data.notice && <p role="status" className="rounded-xl bg-cream p-3 text-sm">{data.notice}</p>}

      <details className="rounded-2xl border border-line p-4" open={demo ? false : undefined}>
        <summary className="cursor-pointer text-lg font-extrabold text-plum">Nominate a family</summary>
        <form action={demo ? undefined : nominateFamily} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="partner_id" value={data.partnerId} />
          <label className="flex flex-col gap-1 text-sm font-bold">
            Family (first name or initials, kept private)
            <input name="family_label" required maxLength={60} className="field font-normal" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-bold">
            What it will pay for
            <select name="pays_for" className="field font-normal">
              {data.paysFor.map((x) => <option key={x}>{x}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-bold">
            Amount
            <select name="amount" className="field font-normal">
              <option value="25000">£250</option>
              <option value="50000">£500</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-bold">
            Who we pay (supplier)
            <input name="supplier_name" required maxLength={120} placeholder="e.g. Rose Florist, Swadlincote" className="field font-normal" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-bold sm:col-span-2">
            Invoice reference or supplier contact (kept private)
            <input name="supplier_details" maxLength={300} className="field font-normal" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-bold sm:col-span-2">
            Their situation, in a sentence or two (kept private)
            <textarea name="situation" rows={3} maxLength={1500} className="field font-normal" />
          </label>
          <label className="flex items-start gap-3 text-sm sm:col-span-2">
            <input type="checkbox" name="consent" required className="mt-0.5 h-5 w-5 shrink-0" />
            <span>
              The family has agreed to be nominated, and understands KeepNear will publish an anonymous record (the
              month, what it paid for, the amount and our firm&apos;s name). Their name is never shown.
            </span>
          </label>
          <button type="submit" className="btn self-start" disabled={demo}>{demo ? "Example only" : "Send nomination"}</button>
        </form>
        <p className="mt-3 text-xs text-muted">
          The family doesn&apos;t need to be a KeepNear customer. We pay the supplier directly, never cash, usually within 5
          working days of approval.
        </p>
      </details>

      {data.awards.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <caption className="pb-2 text-left font-extrabold text-plum">Your nominations</caption>
            <thead className="bg-cream">
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2">Family</th>
                <th className="p-2">For</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.awards.map((a) => (
                <tr key={a.id} className="border-t border-line">
                  <td className="p-2">{new Date(a.created_at).toLocaleDateString("en-GB")}</td>
                  <td className="p-2">{a.family_label}</td>
                  <td className="p-2">{a.pays_for}</td>
                  <td className="p-2">{gbp(a.amount_pence)}</td>
                  <td className="p-2 font-bold">{STATUS[a.status] ?? a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
