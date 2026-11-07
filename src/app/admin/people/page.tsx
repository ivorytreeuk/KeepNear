import { createAdminClient } from "@/lib/supabase/admin";
import { allUsers } from "@/lib/admin-data";
import { getPlan } from "@/lib/plans";
import { deliveryLine } from "@/lib/keepsake-types";
import { cancelRelease, releaseNow, startRelease } from "../actions";

const NOTICES: Record<string, string> = {
  started: "Release started. The account owner has been emailed, and nothing will be sent for 14 days.",
  cancelled: "Release cancelled. Nothing has been sent.",
  released: "Released.",
};

const ERRORS: Record<string, string> = {
  details: "Please fill in who reported the death and what evidence you've seen.",
  hold: "The 14-day hold hasn't finished. Tick the override box only if you're certain.",
  nocase: "There's no active release for this account.",
};

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const admin = createAdminClient();
  const users = await allUsers();
  const { data: profiles } = await admin.from("profiles").select("id, full_name, plan, plan_interval, created_at, referred_by");
  const prof = new Map((profiles ?? []).map((p) => [p.id, p]));

  const matches = q
    ? users.filter((u) => u.id === q || u.email.toLowerCase().includes(q) || (prof.get(u.id)?.full_name ?? "").toLowerCase().includes(q))
    : users.slice().sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 25);

  const showDetail = matches.length > 0 && matches.length <= 5;
  const ids = matches.map((m) => m.id);
  const [{ data: ks }, { data: holders }, { data: cases }, { data: recs }] = showDetail
    ? await Promise.all([
        admin.from("keepsakes").select("id, owner_id, title, kind, category, release_on, release_date, status").in("owner_id", ids).order("created_at"),
        admin.from("release_holders").select("*").in("owner_id", ids),
        admin.from("release_cases").select("*").in("owner_id", ids),
        admin.from("recipients").select("owner_id, full_name, email, phone, relationship").in("owner_id", ids),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold text-plum">People and releases</h1>

      {Object.keys(NOTICES).map((k) => sp[k] && (
        <p key={k} role="status" className="rounded-xl bg-white p-3 text-sm">
          {NOTICES[k]} {k === "released" && `${sp.sent ?? 0} sent now${Number(sp.failed) ? `, ${sp.failed} failed` : ""}; any dated messages will go out on their dates.`}
        </p>
      ))}
      {sp.error && ERRORS[sp.error] && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{ERRORS[sp.error]}</p>}

      <form className="flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="q">Search by name or email</label>
        <input id="q" name="q" defaultValue={sp.q ?? ""} placeholder="Search by name or email" className="field max-w-md" />
        <button type="submit" className="btn">Search</button>
      </form>

      {!showDetail && (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-cream">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((u) => (
                <tr key={u.id} className="border-t border-line">
                  <td className="p-3">
                    <a href={`/admin/people?q=${u.id}`} className="font-bold text-plum underline">{prof.get(u.id)?.full_name || "(no name)"}</a>
                  </td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{getPlan(prof.get(u.id)?.plan).name}</td>
                  <td className="p-3">{new Date(u.created_at).toLocaleDateString("en-GB")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {matches.length === 0 && <p className="p-4 text-muted">Nobody found.</p>}
        </div>
      )}

      {showDetail &&
        matches.map((u) => {
          const p = prof.get(u.id);
          const h = (holders ?? []).find((x) => x.owner_id === u.id);
          const c = (cases ?? []).find((x) => x.owner_id === u.id);
          const mine = (ks ?? []).filter((k) => k.owner_id === u.id);
          const people = (recs ?? []).filter((r) => r.owner_id === u.id);
          const holdLeft = c ? Math.ceil((new Date(c.hold_until).getTime() - Date.now()) / 86400000) : 0;
          return (
            <section key={u.id} className="card flex flex-col gap-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-extrabold text-plum">{p?.full_name || "(no name)"}</h2>
                  <p className="text-muted">{u.email} · {getPlan(p?.plan).name} plan · joined {new Date(u.created_at).toLocaleDateString("en-GB")}</p>
                </div>
                {c && (
                  <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${c.status === "released" ? "bg-plum text-cream" : c.status === "hold" ? "bg-peach text-plum-dark" : "bg-cream text-muted"}`}>
                    Release: {c.status === "hold" ? `on hold, ${holdLeft > 0 ? `${holdLeft} days left` : "ready"}` : c.status}
                  </span>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-bold">Release holder</h3>
                  {h ? (
                    <p className="text-sm">
                      {h.full_name} ({h.role.replace("_", " ")}){h.firm ? `, ${h.firm}` : ""}<br />
                      <a href={`mailto:${h.email}`} className="text-plum underline">{h.email}</a>{h.phone ? ` · ${h.phone}` : ""}
                    </p>
                  ) : (
                    <p className="text-sm text-muted">None named.</p>
                  )}
                </div>
                <div>
                  <h3 className="font-bold">Recipients</h3>
                  <ul className="text-sm">
                    {people.length === 0 && <li className="text-muted">None.</li>}
                    {people.map((r, i) => (
                      <li key={i}>
                        {r.full_name}{r.relationship ? ` (${r.relationship})` : ""}: {r.email || <span className="font-bold text-red-800">no email</span>}{r.phone ? ` · ${r.phone}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-bold">Keepsakes ({mine.length})</h3>
                <ul className="mt-1 text-sm">
                  {mine.map((k) => (
                    <li key={k.id} className="border-t border-line py-1.5">
                      {k.title} <span className="text-muted">· {k.kind} · {deliveryLine(k)}{k.status !== "ready" ? " · not finished uploading" : ""}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-cream p-4">
                <h3 className="font-bold text-plum">Release after death</h3>
                {!c || c.status === "cancelled" ? (
                  <form action={startRelease} className="mt-3 grid gap-3 md:grid-cols-2">
                    <input type="hidden" name="owner_id" value={u.id} />
                    <label className="flex flex-col gap-1 text-sm font-bold">
                      Reported by (name and role)
                      <input name="reported_by" required className="field font-normal" placeholder={h ? `${h.full_name}, ${h.role.replace("_", " ")}` : ""} />
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-bold md:col-span-2">
                      Evidence seen (death certificate number, date of death, how verified)
                      <textarea name="evidence" required rows={3} className="field font-normal" />
                    </label>
                    <p className="text-xs text-muted md:col-span-2">
                      Starting a release emails the account owner and holds everything for 14 days. Nothing is sent to
                      recipients until you press Release.
                    </p>
                    <button type="submit" className="btn self-start">Start 14-day hold</button>
                  </form>
                ) : c.status === "hold" ? (
                  <div className="mt-3 flex flex-col gap-3">
                    <p className="text-sm">
                      Reported by <strong>{c.reported_by}</strong> on {new Date(c.started_at).toLocaleDateString("en-GB")}.<br />
                      Evidence: {c.evidence}
                    </p>
                    <form action={releaseNow} className="flex flex-col gap-2">
                      <input type="hidden" name="owner_id" value={u.id} />
                      {holdLeft > 0 && (
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" name="override" className="h-5 w-5" />
                          Release before the 14 days are up (only if you&apos;re certain)
                        </label>
                      )}
                      <button type="submit" className="btn self-start">Release to recipients</button>
                    </form>
                    <form action={cancelRelease}>
                      <input type="hidden" name="owner_id" value={u.id} />
                      <button type="submit" className="text-sm font-bold text-red-800 underline">Cancel this release</button>
                    </form>
                  </div>
                ) : (
                  <p className="mt-2 text-sm">Released on {c.released_at ? new Date(c.released_at).toLocaleDateString("en-GB") : ""}.</p>
                )}
              </div>
            </section>
          );
        })}
    </div>
  );
}
