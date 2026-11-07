import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { createAdminClient } from "@/lib/supabase/admin";
import { PARTNER_TYPES } from "@/lib/admin-data";

export const metadata = {
  title: "Recommended partners · KeepNear",
  description: "Solicitors, will writers, funeral directors and other trusted services recommended by KeepNear.",
};
export const dynamic = "force-dynamic";

const PLURAL: Record<string, string> = {
  solicitor: "Solicitors",
  will_writer: "Will writers",
  funeral_director: "Funeral directors",
  insurer: "Life insurance",
  financial_adviser: "Financial advisers",
  hospice: "Hospices",
  other: "Other services",
};

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const type = sp.type && PARTNER_TYPES[sp.type] ? sp.type : null;

  let partners: { id: string; slug: string; name: string; type: string; description: string | null; region: string | null; website: string | null }[] = [];
  try {
    const admin = createAdminClient();
    let q = admin.from("partners").select("id, slug, name, type, description, region, website").eq("active", true).order("name");
    if (type) q = q.eq("type", type);
    const { data } = await q;
    partners = data ?? [];
    if (partners.length) {
      await admin.from("partner_events").insert(partners.map((p) => ({ partner_id: p.id, type: "directory_view", source: type ?? "all" })));
    }
  } catch {
    partners = [];
  }

  const groups = Object.keys(PLURAL)
    .map((t) => ({ t, items: partners.filter((p) => p.type === t) }))
    .filter((g) => g.items.length);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-4xl font-extrabold text-plum">{type ? `Recommended ${PLURAL[type].toLowerCase()}` : "Recommended partners"}</h1>
        <p className="mt-3 max-w-2xl text-lg">
          Trusted firms who know KeepNear and can act as your release holder, help with your will, or support your
          family when the time comes.
        </p>

        <nav aria-label="Filter by type" className="mt-6 flex flex-wrap gap-2 text-sm font-bold">
          <Link href="/directory" className={`rounded-full border border-line px-4 py-2 ${!type ? "bg-plum text-cream" : "bg-white text-plum"}`}>All</Link>
          {Object.entries(PLURAL).filter(([t]) => t !== "other").map(([t, l]) => (
            <Link key={t} href={`/directory?type=${t}`} className={`rounded-full border border-line px-4 py-2 ${type === t ? "bg-plum text-cream" : "bg-white text-plum"}`}>{l}</Link>
          ))}
        </nav>

        {groups.length === 0 ? (
          <div className="card mt-8 max-w-2xl">
            <h2 className="text-xl font-extrabold text-plum">We&apos;re adding partners now</h2>
            <p className="mt-2">
              We&apos;re still building our list{type ? ` of ${PLURAL[type].toLowerCase()}` : ""}. In the meantime, the{" "}
              <a href="https://solicitors.lawsociety.org.uk/" target="_blank" rel="noopener noreferrer" className="font-bold text-plum underline">Law Society&apos;s Find a Solicitor</a>{" "}
              lists every regulated solicitor in England and Wales. You can also name an executor or a family member you
              trust as your release holder.
            </p>
            <p className="mt-3 text-sm text-muted">
              Are you a firm who&apos;d like to be listed? <Link href="/partners" className="font-bold text-plum underline">Become a partner</Link>.
            </p>
          </div>
        ) : (
          groups.map((g) => (
            <section key={g.t} className="mt-10" aria-labelledby={`h-${g.t}`}>
              <h2 id={`h-${g.t}`} className="text-2xl font-extrabold text-plum">{PLURAL[g.t]}</h2>
              <ul className="mt-4 grid gap-4 md:grid-cols-2">
                {g.items.map((p) => (
                  <li key={p.id} className="card flex flex-col gap-2">
                    <h3 className="text-lg font-extrabold">{p.name}</h3>
                    {p.region && <p className="text-sm font-bold text-muted">{p.region}</p>}
                    {p.description && <p className="text-sm">{p.description}</p>}
                    {p.website && (
                      <a href={`/go/${p.slug}`} target="_blank" rel="noopener" className="btn mt-2 self-start">
                        Visit their website <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}

        <p className="mt-10 max-w-2xl text-sm text-muted">
          KeepNear may receive a fee from partners listed here. It never affects how your keepsakes are kept or
          released, and you&apos;re free to choose any solicitor, executor or funeral director you like.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
