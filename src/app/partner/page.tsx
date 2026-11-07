import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PARTNER_TYPES, gbp, partnerStats } from "@/lib/admin-data";
import { Logo } from "@/components/Logo";
import { IdleLogout } from "@/components/IdleLogout";

export const metadata = { title: "Partner dashboard · KeepNear", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://keepnear.co.uk").replace(/\/$/, "");

function monthName(m: string) {
  return new Date(`${m}-01T00:00:00`).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export default async function PartnerDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = (user?.email ?? "").toLowerCase();

  const admin = createAdminClient();
  const { data: memberships } = await admin.from("partner_members").select("partner_id").eq("email", email);
  const ids = (memberships ?? []).map((m) => m.partner_id);
  const { data: partners } = ids.length
    ? await admin.from("partners").select("id, slug, name, type, commission_rate, active, website, reference, source").in("id", ids)
    : { data: [] };
  const list = partners ?? [];
  const stats = await partnerStats(list);

  return (
    <div className="min-h-screen">
      <IdleLogout />
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Logo size={28} />
            <span className="rounded-full bg-cream px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-plum">Partner</span>
          </div>
          <Link href="/" className="text-sm font-bold text-plum underline">keepnear.co.uk</Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {list.length === 0 ? (
          <div className="card max-w-xl">
            <h1 className="text-2xl font-extrabold text-plum">No partner account linked</h1>
            <p className="mt-2">
              You&apos;re logged in as <strong>{user?.email}</strong>, but this email isn&apos;t linked to a KeepNear
              partner yet. If your firm has partnered with us, email{" "}
              <a href="mailto:info@keepnear.co.uk" className="font-bold text-plum underline">info@keepnear.co.uk</a>{" "}
              and we&apos;ll add you.
            </p>
            <p className="mt-3">
              Not a partner yet? <Link href="/partners" className="font-bold text-plum underline">Find out about partnering</Link>.
            </p>
          </div>
        ) : (
          list.map((p) => {
            const s = stats[p.id];
            const tiles: [string, string | number, string][] = [
              ["Seen in our directory", s.views, `${s.views30} in the last 30 days`],
              ["Clicks to your website", s.clicks, `${s.clicks30} in the last 30 days`],
              ["Visits from your link", s.visits, `${s.visits30} in the last 30 days`],
              ["Clients who signed up", s.signups, `${s.paying} on a paid plan`],
              ["Revenue from your clients", gbp(s.revenuePence), "Payments received by KeepNear"],
              ["Your earnings", gbp(s.commissionPence), `${Number(p.commission_rate)}% revenue share`],
            ];
            return (
              <section key={p.id} className="flex flex-col gap-6" aria-labelledby={`p-${p.id}`}>
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
                        <th className="p-3">Your earnings</th>
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
                          <td className="p-3">{gbp(Math.round((m.revenuePence * Number(p.commission_rate)) / 100))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-sm text-muted">
                  Earnings are paid quarterly once they reach £50. For privacy, we never share the names or details of
                  your clients&apos; KeepNear accounts. Questions? Email{" "}
                  <a href="mailto:info@keepnear.co.uk" className="font-bold text-plum underline">info@keepnear.co.uk</a>.
                </p>
              </section>
            );
          })
        )}
      </main>
    </div>
  );
}
