import { gbp } from "@/lib/admin-data";
import { giftFund } from "@/lib/gift";
import { decideGift } from "../actions";

const LABEL: Record<string, string> = { pending: "Waiting", approved: "Approved, not yet paid", paid: "Paid", declined: "Declined" };

export default async function AdminGift({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const fund = await giftFund();
  const names = new Map(fund.partners.map((p) => [p.id, p.name]));
  const waiting = fund.awards.filter((a) => a.status === "pending");
  const toPay = fund.awards.filter((a) => a.status === "approved");
  const past = fund.awards.filter((a) => a.status === "paid" || a.status === "declined");

  const Row = ({ a, children }: { a: (typeof fund.awards)[number]; children?: React.ReactNode }) => (
    <li className="card flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-lg font-extrabold text-plum">
          {gbp(a.amount_pence)} · {a.pays_for}
        </p>
        <p className="text-sm text-muted">
          {names.get(a.partner_id ?? "") ?? "Unknown partner"} · {new Date(a.created_at).toLocaleDateString("en-GB")} · {LABEL[a.status]}
        </p>
      </div>
      <p className="text-sm">
        <strong>Family:</strong> {a.family_label} · <strong>Pay:</strong> {a.supplier_name}
        {a.supplier_details ? ` (${a.supplier_details})` : ""}
      </p>
      {a.situation && <p className="text-sm text-muted">{a.situation}</p>}
      {a.admin_note && <p className="text-sm"><strong>Note:</strong> {a.admin_note}</p>}
      {children}
    </li>
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold text-plum">KeepNear Gift</h1>
        <p className="text-muted">Money in from Gift partners&apos; clients, nominations to review, and Gifts to pay.</p>
      </div>
      {sp.done && <p role="status" className="rounded-xl bg-white p-3 text-sm">Saved. The public Gift page is updated.</p>}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Fund">
        {[
          ["In the pot now", gbp(fund.available), "after approved Gifts"],
          ["Added so far", gbp(fund.totalIn), "from Gift partners' clients"],
          ["Paid out", gbp(fund.totalPaid), `${fund.familiesHelped} families helped`],
          ["Approved, to pay", gbp(fund.committed), `${toPay.length} Gifts`],
        ].map(([l, v, sub]) => (
          <div key={l} className="card">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">{l}</p>
            <p className="mt-1 text-3xl font-extrabold text-plum">{v}</p>
            <p className="text-sm text-muted">{sub}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="w">
        <h2 id="w" className="text-xl font-extrabold text-plum">To review ({waiting.length})</h2>
        {waiting.length === 0 ? (
          <p className="mt-2 text-muted">No nominations waiting.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {waiting.map((a) => {
              const b = fund.byPartner[a.partner_id ?? ""];
              const partnerLeft = b ? b.added - b.paid - b.committed : 0;
              return (
                <Row key={a.id} a={a}>
                  <p className="text-sm">
                    This partner&apos;s clients have added {gbp(b?.added ?? 0)}; {gbp(Math.max(0, partnerLeft))} left for them to award.
                    {partnerLeft < a.amount_pence && " Approving uses the shared pot."}
                  </p>
                  <form action={decideGift} className="flex flex-wrap items-end gap-2">
                    <input type="hidden" name="id" value={a.id} />
                    <label className="flex flex-1 flex-col gap-1 text-sm font-bold">
                      Note (optional)
                      <input name="note" className="field font-normal" />
                    </label>
                    <button name="do" value="approve" className="btn">Approve</button>
                    <button name="do" value="decline" className="rounded-full border border-line px-5 py-3 font-bold text-plum">Decline</button>
                  </form>
                </Row>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="p">
        <h2 id="p" className="text-xl font-extrabold text-plum">Approved: pay the supplier, then mark as paid ({toPay.length})</h2>
        <ul className="mt-3 flex flex-col gap-3">
          {toPay.map((a) => (
            <Row key={a.id} a={a}>
              <form action={decideGift} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="id" value={a.id} />
                <label className="flex flex-1 flex-col gap-1 text-sm font-bold">
                  Payment reference (optional)
                  <input name="note" className="field font-normal" />
                </label>
                <button name="do" value="paid" className="btn">Mark as paid</button>
              </form>
            </Row>
          ))}
        </ul>
      </section>

      {past.length > 0 && (
        <section aria-labelledby="h">
          <h2 id="h" className="text-xl font-extrabold text-plum">History</h2>
          <ul className="mt-3 flex flex-col gap-3">
            {past.map((a) => <Row key={a.id} a={a} />)}
          </ul>
        </section>
      )}
    </div>
  );
}
