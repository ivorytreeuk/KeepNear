import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { partnerStats } from "@/lib/admin-data";
import { PartnerView } from "@/components/PartnerView";
import { PAYS_FOR, giftFund } from "@/lib/gift";
import { getAdminUser, isAdminUnlocked } from "@/lib/admin-auth";
import { Logo } from "@/components/Logo";
import { IdleLogout } from "@/components/IdleLogout";

export const metadata = { title: "Partner dashboard · KeepNear", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PartnerDashboard({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = (user?.email ?? "").toLowerCase();

  const admin = createAdminClient();
  // KeepNear staff can preview any partner's dashboard from Admin → Partners.
  const adminUser = sp.as ? await getAdminUser() : null;
  const viewingAs = Boolean(sp.as && adminUser && (await isAdminUnlocked(adminUser.id)) && /^[0-9a-f-]{36}$/i.test(sp.as));
  const { data: memberships } = viewingAs
    ? { data: [{ partner_id: sp.as as string }] }
    : await admin.from("partner_members").select("partner_id").eq("email", email);
  const ids = (memberships ?? []).map((m) => m.partner_id);
  const { data: partners } = ids.length
    ? await admin.from("partners").select("*").in("id", ids)
    : { data: [] };
  const list = partners ?? [];
  const stats = await partnerStats(list);
  const fund = list.some((p) => (p.reward ?? "gift") === "gift") ? await giftFund() : null;
  const GIFT_NOTICES: Record<string, string> = {
    sent: "Thank you. We've received your nomination and will review it within 5 working days.",
    missing: "Please fill in the family, the supplier, and confirm the family has agreed.",
    error: "Something went wrong saving that nomination. Please try again or email info@keepnear.co.uk.",
    denied: "Only people linked to this partner can nominate.",
  };
  const giftFor = (id: string) =>
    fund
      ? {
          partnerId: id,
          added: fund.byPartner[id]?.added ?? 0,
          paid: fund.byPartner[id]?.paid ?? 0,
          committed: fund.byPartner[id]?.committed ?? 0,
          potAvailable: fund.available,
          awards: fund.awards.filter((a) => a.partner_id === id),
          paysFor: PAYS_FOR,
          notice: sp.gift ? GIFT_NOTICES[sp.gift] : undefined,
        }
      : undefined;

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
        {viewingAs && (
          <p role="status" className="mb-6 rounded-2xl bg-plum p-3 text-sm font-bold text-cream">
            Admin preview: this is exactly what this partner sees. <Link href="/admin/partners" className="underline">Back to admin</Link>
          </p>
        )}
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
          list.map((p) => <PartnerView key={p.id} p={p} s={stats[p.id]} gift={giftFor(p.id)} />)
        )}
      </main>
    </div>
  );
}
