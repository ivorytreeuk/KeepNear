import { createAdminClient } from "@/lib/supabase/admin";
import { PARTNER_TYPES, gbp, partnerStats } from "@/lib/admin-data";
import { createPartner, updatePartner } from "../actions";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://keepnear.co.uk").replace(/\/$/, "");

type Partner = {
  id: string;
  slug: string;
  name: string;
  type: string;
  website: string | null;
  description: string | null;
  region: string | null;
  contact_email: string | null;
  phone: string | null;
  commission_rate: number;
  active: boolean;
  reference: string | null;
  source: string | null;
  contact_name: string | null;
  promo_code: string | null;
};

function PartnerForm({ p, members, action, submit }: { p?: Partner; members?: string; action: (f: FormData) => Promise<void>; submit: string }) {
  return (
    <form action={action} className="grid gap-3 md:grid-cols-2">
      {p && <input type="hidden" name="id" value={p.id} />}
      <label className="flex flex-col gap-1 text-sm font-bold">
        Organisation name
        <input name="name" required defaultValue={p?.name} className="field font-normal" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-bold">
        Type
        <select name="type" defaultValue={p?.type ?? "solicitor"} className="field font-normal">
          {Object.entries(PARTNER_TYPES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm font-bold">
        Website
        <input name="website" defaultValue={p?.website ?? ""} placeholder="https://" className="field font-normal" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-bold">
        Area they cover
        <input name="region" defaultValue={p?.region ?? ""} placeholder="Derbyshire and East Midlands" className="field font-normal" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-bold md:col-span-2">
        Short description for the directory
        <textarea name="description" rows={2} maxLength={600} defaultValue={p?.description ?? ""} className="field font-normal" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-bold">
        Contact email
        <input name="contact_email" type="email" defaultValue={p?.contact_email ?? ""} className="field font-normal" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-bold">
        Phone
        <input name="phone" defaultValue={p?.phone ?? ""} className="field font-normal" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-bold">
        Commission (% of revenue from their referrals)
        <input name="commission_rate" type="number" min={0} max={100} step="0.5" defaultValue={p?.commission_rate ?? 20} className="field font-normal" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-bold">
        Clients&apos; discount code (create the same code in Stripe)
        <input name="promo_code" defaultValue={p?.promo_code ?? ""} placeholder="HARPER25" className="field font-normal uppercase" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-bold">
        Dashboard logins (KeepNear account emails, comma-separated)
        <input name="members" defaultValue={members ?? ""} className="field font-normal" />
      </label>
      {!p && (
        <label className="flex flex-col gap-1 text-sm font-bold">
          Link name (optional)
          <input name="slug" placeholder="smith-and-co" className="field font-normal" />
        </label>
      )}
      <label className="flex items-center gap-2 text-sm font-bold">
        <input type="checkbox" name="active" defaultChecked={p ? p.active : true} className="h-5 w-5" />
        Show in the public directory
      </label>
      <button type="submit" className="btn self-start md:col-span-2">{submit}</button>
    </form>
  );
}

export default async function PartnersAdmin({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const admin = createAdminClient();
  const [{ data: partners }, { data: members }] = await Promise.all([
    admin.from("partners").select("*").order("created_at", { ascending: false }),
    admin.from("partner_members").select("partner_id, email"),
  ]);
  const list = (partners ?? []) as Partner[];
  const stats = await partnerStats(list);
  const totals = Object.values(stats).reduce(
    (t, s) => ({ clicks: t.clicks + s.clicks, signups: t.signups + s.signups, revenue: t.revenue + s.revenuePence, commission: t.commission + s.commissionPence }),
    { clicks: 0, signups: 0, revenue: 0, commission: 0 }
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold text-plum">Partners</h1>
        <p className="text-muted">
          Traffic both ways: people KeepNear sends to partners (directory clicks), and customers partners send to
          KeepNear (referral link), with the revenue and commission they generate.
        </p>
      </div>

      {sp.created && <p role="status" className="rounded-xl bg-white p-3 text-sm">Partner added.</p>}
      {sp.saved && <p role="status" className="rounded-xl bg-white p-3 text-sm">Partner saved.</p>}
      {sp.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">Please check the details and try again.</p>}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Totals">
        {[
          ["Partners", list.length],
          ["Clicks sent to partners", totals.clicks],
          ["Sign-ups from partners", totals.signups],
          ["Revenue from partners", `${gbp(totals.revenue)} (${gbp(totals.commission)} commission)`],
        ].map(([l, v]) => (
          <div key={l as string} className="card">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">{l}</p>
            <p className="mt-1 text-2xl font-extrabold text-plum">{v}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="plist">
        <h2 id="plist" className="sr-only">All partners</h2>
        {list.length === 0 ? (
          <p className="card text-muted">No partners yet. Add your first one below.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-cream">
                <tr>
                  <th className="p-3">Partner</th>
                  <th className="p-3">Directory views</th>
                  <th className="p-3">Clicks to them</th>
                  <th className="p-3">Visits from them</th>
                  <th className="p-3">Sign-ups</th>
                  <th className="p-3">Paying</th>
                  <th className="p-3">Revenue</th>
                  <th className="p-3">Commission owed</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => {
                  const s = stats[p.id];
                  return (
                    <tr key={p.id} className="border-t border-line align-top">
                      <td className="p-3">
                        <p className="font-bold">
                          {p.name}{" "}
                          {!p.active && (
                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${p.source === "signup" ? "bg-peach text-plum-dark" : "text-muted"}`}>
                              {p.source === "signup" ? "New: check and approve" : "hidden"}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted">{p.reference ?? ""} · {PARTNER_TYPES[p.type]} · {p.commission_rate}%</p>
                      </td>
                      <td className="p-3">{s.views}<span className="block text-xs text-muted">{s.views30} in 30 days</span></td>
                      <td className="p-3">{s.clicks}<span className="block text-xs text-muted">{s.clicks30} in 30 days</span></td>
                      <td className="p-3">{s.visits}<span className="block text-xs text-muted">{s.visits30} in 30 days</span></td>
                      <td className="p-3">{s.signups}</td>
                      <td className="p-3">{s.paying}</td>
                      <td className="p-3">{gbp(s.revenuePence)}</td>
                      <td className="p-3 font-bold">{gbp(s.commissionPence)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {list.map((p) => (
        <details key={p.id} className="card">
          <summary className="cursor-pointer text-lg font-extrabold text-plum">{p.name}: links and settings</summary>
          <div className="mt-4 grid gap-2 rounded-2xl bg-cream p-4 text-sm">
            <p><strong>Partner reference:</strong> <span className="font-mono">{p.reference ?? "run migration 0006"}</span>{p.contact_name ? ` · contact: ${p.contact_name}` : ""}{p.contact_email ? ` · ${p.contact_email}` : ""}</p>
            {!p.active && p.source === "signup" && (
              <p className="font-bold text-plum-dark">Registered online. Check the firm is genuine (e.g. on the SRA or Law Society register), then tick &ldquo;Show in the public directory&rdquo; and save.</p>
            )}
            <p><strong>Referral link to give them:</strong> <code className="break-all">{SITE}/r/{p.slug}</code></p>
            <p><strong>Their directory listing:</strong> <a className="text-plum underline" href={`/directory?type=${p.type}`} target="_blank" rel="noopener noreferrer">{SITE}/directory</a></p>
            <p><strong>Partner dashboard:</strong> {SITE}/partner/login · <a href={`/partner?as=${p.id}`} target="_blank" rel="noopener" className="font-bold text-plum underline">See their dashboard as they see it</a></p>
          </div>
          <div className="mt-4">
            <PartnerForm
              p={p}
              members={(members ?? []).filter((m) => m.partner_id === p.id).map((m) => m.email).join(", ")}
              action={updatePartner}
              submit="Save changes"
            />
          </div>
        </details>
      ))}

      <section className="card" aria-labelledby="add">
        <h2 id="add" className="text-xl font-extrabold text-plum">Add a partner</h2>
        <div className="mt-4">
          <PartnerForm action={createPartner} submit="Add partner" />
        </div>
      </section>
    </div>
  );
}
