import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { allUsers, daysUntil, gbp, mrrPence } from "@/lib/admin-data";
import { ukToday } from "@/lib/delivery";
import { fmtDate } from "@/lib/keepsake-types";
import { emailEnabled } from "@/lib/email";
import { runDailyNow, sendNow } from "./actions";

function Stat({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <div className="card">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-plum">{value}</p>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
    </div>
  );
}

function Urgency({ days }: { days: number }) {
  const cls =
    days < 0 ? "bg-red-800 text-white" : days === 0 ? "bg-red-700 text-white" : days <= 7 ? "bg-peach text-plum-dark" : "bg-cream text-muted";
  const label = days < 0 ? `${-days}d overdue` : days === 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} days`;
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-extrabold ${cls}`}>{label}</span>;
}

export default async function AdminOverview({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const admin = createAdminClient();
  const today = ukToday();
  const in90 = ukToday(90);
  const since30 = new Date(Date.now() - 30 * 86400000).toISOString();
  const since7 = new Date(Date.now() - 7 * 86400000).toISOString();

  const [users, { data: profiles }, { data: keepsakes }, { data: upcoming }, { data: failed }, { data: cases }, { data: pays }, { data: apps }, { data: msgs }, { data: scheduledLegacy }] =
    await Promise.all([
      allUsers(),
      admin.from("profiles").select("id, full_name, plan, plan_interval, created_at"),
      admin.from("keepsakes").select("category"),
      admin
        .from("keepsakes")
        .select("id, title, kind, owner_id, release_date, keepsake_recipients(recipients(full_name, email))")
        .eq("category", "living")
        .eq("status", "ready")
        .gte("release_date", today)
        .lte("release_date", in90)
        .order("release_date"),
      admin
        .from("deliveries")
        .select("id, error, keepsake_id, keepsakes(title), recipients(full_name, email, phone)")
        .eq("status", "failed")
        .limit(50),
      admin.from("release_cases").select("*").eq("status", "hold").order("hold_until"),
      admin.from("payments").select("amount_pence").gte("created_at", since30),
      admin.from("partner_applications").select("*").order("created_at", { ascending: false }).limit(8),
      admin.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(8),
      admin
        .from("deliveries")
        .select("id, scheduled_for, keepsakes(id, title, owner_id), recipients(full_name)")
        .eq("status", "scheduled")
        .gt("scheduled_for", today)
        .lte("scheduled_for", in90)
        .order("scheduled_for"),
    ]);

  const emailOf = new Map(users.map((u) => [u.id, u.email]));
  const nameOf = new Map((profiles ?? []).map((p) => [p.id, p.full_name as string | null]));
  const who = (id: string) => nameOf.get(id) || emailOf.get(id) || "Unknown";
  const paying = (profiles ?? []).filter((p) => p.plan && p.plan !== "free");
  const newUsers = (profiles ?? []).filter((p) => p.created_at >= since7).length;
  const revenue30 = (pays ?? []).reduce((s, p) => s + p.amount_pence, 0);
  const legacyCount = (keepsakes ?? []).filter((k) => k.category !== "living").length;
  const livingCount = (keepsakes ?? []).filter((k) => k.category === "living").length;
  const readyToRelease = (cases ?? []).filter((c) => new Date(c.hold_until) <= new Date());

  type Row = { key: string; date: string; title: string; owner: string; to: string; kind: string; keepsakeId: string; missingEmail: boolean };
  const rows: Row[] = [];
  for (const k of upcoming ?? []) {
    const recs = ((k.keepsake_recipients as unknown as { recipients: { full_name: string; email: string | null } | null }[]) ?? [])
      .map((r) => r.recipients)
      .filter(Boolean) as { full_name: string; email: string | null }[];
    rows.push({
      key: `k-${k.id}`,
      date: k.release_date as string,
      title: k.title,
      owner: who(k.owner_id),
      to: recs.map((r) => r.full_name).join(", ") || "No recipients yet",
      kind: "Time capsule",
      keepsakeId: k.id,
      missingEmail: recs.length === 0 || recs.some((r) => !r.email),
    });
  }
  for (const d of scheduledLegacy ?? []) {
    const k = d.keepsakes as unknown as { id: string; title: string; owner_id: string } | null;
    if (!k) continue;
    rows.push({
      key: `d-${d.id}`,
      date: d.scheduled_for,
      title: k.title,
      owner: who(k.owner_id),
      to: (d.recipients as unknown as { full_name: string } | null)?.full_name ?? "",
      kind: "After death, dated",
      keepsakeId: k.id,
      missingEmail: false,
    });
  }
  rows.sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-plum">Overview</h1>
          <p className="text-muted">Today is {fmtDate(today)}. Deliveries run automatically every morning at 7am.</p>
        </div>
        <form action={runDailyNow}>
          <button type="submit" className="btn-outline">Run today&apos;s deliveries now</button>
        </form>
      </div>

      {sp.sent !== undefined && (
        <p role="status" className="rounded-xl bg-white p-3 text-sm">
          Sent {sp.sent} email{sp.sent === "1" ? "" : "s"}{Number(sp.failed) ? `, ${sp.failed} failed (see below)` : ""}
          {sp.reminders ? `, ${sp.reminders} reminder(s)` : ""}.
        </p>
      )}
      {!emailEnabled() && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
          Emails can&apos;t be sent yet: add <code>RESEND_API_KEY</code> in Vercel and redeploy.
        </p>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Key numbers">
        <Stat label="Accounts" value={users.length} note={`${newUsers} new in the last 7 days`} />
        <Stat label="Paying customers" value={paying.length} note={`${users.length ? Math.round((paying.length / users.length) * 100) : 0}% of accounts`} />
        <Stat label="Monthly recurring revenue" value={gbp(mrrPence(paying))} note={`${gbp(revenue30)} received in the last 30 days`} />
        <Stat label="Keepsakes stored" value={legacyCount + livingCount} note={`${legacyCount} after death · ${livingCount} time capsules`} />
      </section>

      {(readyToRelease.length > 0 || (failed ?? []).length > 0 || rows.some((r) => r.missingEmail && daysUntil(r.date) <= 14)) && (
        <section aria-labelledby="attention" className="rounded-3xl border-2 border-red-800 bg-white p-5">
          <h2 id="attention" className="text-xl font-extrabold text-red-800">Needs your attention</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {readyToRelease.map((c) => (
              <li key={c.owner_id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-cream p-3">
                <span>
                  <strong>{who(c.owner_id)}</strong>: 14-day hold finished. Ready for you to release.
                </span>
                <Link href={`/admin/people?q=${c.owner_id}`} className="font-bold text-plum underline">Review and release</Link>
              </li>
            ))}
            {(failed ?? []).map((f) => {
              const r = f.recipients as unknown as { full_name: string; email: string | null; phone: string | null } | null;
              return (
                <li key={f.id} className="rounded-xl bg-cream p-3">
                  <strong>Delivery failed:</strong> &ldquo;{(f.keepsakes as unknown as { title: string } | null)?.title}&rdquo; to{" "}
                  {r?.full_name}. {f.error}
                  {r?.phone && <> · Phone: <a href={`tel:${r.phone}`} className="font-bold underline">{r.phone}</a></>}
                </li>
              );
            })}
            {rows
              .filter((r) => r.missingEmail && daysUntil(r.date) <= 14)
              .map((r) => (
                <li key={`m-${r.key}`} className="rounded-xl bg-cream p-3">
                  <strong>{fmtDate(r.date)}</strong>: &ldquo;{r.title}&rdquo; ({r.owner}) has a recipient with no email
                  address. Contact the owner before it&apos;s due.
                </li>
              ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="upcoming">
        <h2 id="upcoming" className="text-xl font-extrabold text-plum">Upcoming deliveries (next 90 days)</h2>
        {rows.length === 0 ? (
          <p className="card mt-3 text-muted">Nothing scheduled in the next 90 days.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-cream">
                <tr>
                  <th className="p-3">When</th>
                  <th className="p-3">Keepsake</th>
                  <th className="p-3">From</th>
                  <th className="p-3">To</th>
                  <th className="p-3">Type</th>
                  <th className="p-3"><span className="sr-only">Action</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const days = daysUntil(r.date);
                  return (
                    <tr key={r.key} className={`border-t border-line ${days <= 7 ? "bg-peach/15" : ""}`}>
                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold">{fmtDate(r.date)}</span>
                          <Urgency days={days} />
                        </div>
                      </td>
                      <td className="p-3">{r.title}</td>
                      <td className="p-3">{r.owner}</td>
                      <td className="p-3">
                        {r.to}
                        {r.missingEmail && <span className="block text-xs font-bold text-red-800">Missing email</span>}
                      </td>
                      <td className="p-3">{r.kind}</td>
                      <td className="p-3">
                        <details>
                          <summary className="cursor-pointer whitespace-nowrap font-bold text-plum">Send now</summary>
                          <form action={sendNow} className="mt-2">
                            <input type="hidden" name="keepsake_id" value={r.keepsakeId} />
                            <p className="text-xs text-muted">Sends it to every recipient immediately, early.</p>
                            <button type="submit" className="btn mt-2">Yes, send it now</button>
                          </form>
                        </details>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="holds">
        <h2 id="holds" className="text-xl font-extrabold text-plum">Releases on hold</h2>
        {(cases ?? []).length === 0 ? (
          <p className="card mt-3 text-muted">No releases in progress.</p>
        ) : (
          <ul className="mt-3 grid gap-3 md:grid-cols-2">
            {(cases ?? []).map((c) => {
              const days = Math.ceil((new Date(c.hold_until).getTime() - Date.now()) / 86400000);
              return (
                <li key={c.owner_id} className="card">
                  <p className="font-bold">{who(c.owner_id)}</p>
                  <p className="text-sm text-muted">Reported by {c.reported_by}</p>
                  <p className="mt-2 text-sm">{days > 0 ? `${days} day${days === 1 ? "" : "s"} of hold left` : "Hold finished: ready to release"}</p>
                  <Link href={`/admin/people?q=${c.owner_id}`} className="mt-2 inline-block font-bold text-plum underline">Open</Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="apps">
          <h2 id="apps" className="text-xl font-extrabold text-plum">Partner enquiries</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {(apps ?? []).length === 0 && <li className="card text-muted">None yet.</li>}
            {(apps ?? []).map((a) => (
              <li key={a.id} className="card text-sm">
                <p className="font-bold">{a.organisation} <span className="font-normal text-muted">· {a.type}</span></p>
                <p>{a.contact_name} · <a href={`mailto:${a.email}`} className="text-plum underline">{a.email}</a>{a.phone ? ` · ${a.phone}` : ""}</p>
                {a.message && <p className="mt-1 text-muted">{a.message}</p>}
                <p className="mt-1 text-xs text-muted">{new Date(a.created_at).toLocaleString("en-GB")}</p>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="msgs">
          <h2 id="msgs" className="text-xl font-extrabold text-plum">Contact messages</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {(msgs ?? []).length === 0 && <li className="card text-muted">None yet.</li>}
            {(msgs ?? []).map((m) => (
              <li key={m.id} className="card text-sm">
                <p className="font-bold">{m.full_name} <span className="font-normal text-muted">· {m.topic}</span></p>
                <p><a href={`mailto:${m.email}`} className="text-plum underline">{m.email}</a></p>
                <p className="mt-1 whitespace-pre-line text-muted">{m.message}</p>
                <p className="mt-1 text-xs text-muted">{new Date(m.created_at).toLocaleString("en-GB")}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
