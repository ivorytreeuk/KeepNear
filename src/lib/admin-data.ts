import "server-only";
import { createAdminClient } from "./supabase/admin";
import { getPlan } from "./plans";

export type AdminUser = { id: string; email: string; created_at: string; last_sign_in_at?: string | null };

/** Every account's email (fine for thousands of users; page through in batches of 1,000). */
export async function allUsers(): Promise<AdminUser[]> {
  const admin = createAdminClient();
  const out: AdminUser[] = [];
  for (let page = 1; page <= 20; page++) {
    const { data } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    const users = data?.users ?? [];
    out.push(...users.map((u) => ({ id: u.id, email: u.email ?? "", created_at: u.created_at, last_sign_in_at: u.last_sign_in_at })));
    if (users.length < 1000) break;
  }
  return out;
}

/** Monthly recurring revenue in pence, estimated from each profile's plan and billing interval. */
export function mrrPence(profiles: { plan: string | null; plan_interval: string | null }[]) {
  return profiles.reduce((sum, p) => {
    const plan = getPlan(p.plan);
    if (p.plan_interval === "annual") return sum + Math.round((plan.pence.annual ?? 0) / 12);
    if (p.plan_interval === "monthly") return sum + (plan.pence.monthly ?? 0);
    return sum;
  }, 0);
}

export function gbp(pence: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(pence / 100);
}

export function daysUntil(isoDate: string) {
  const today = new Date(new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(new Date()));
  return Math.round((new Date(isoDate).getTime() - today.getTime()) / 86400000);
}

export type PartnerStats = {
  views: number;
  views30: number;
  clicks: number;
  clicks30: number;
  visits: number;
  visits30: number;
  signups: number;
  paying: number;
  revenuePence: number;
  commissionPence: number;
  monthly: { month: string; clicks: number; visits: number; signups: number; revenuePence: number; sharePence: number }[];
};

/** Traffic and revenue for one or more partners. */
export async function partnerStats(partners: { id: string; commission_rate: number }[]): Promise<Record<string, PartnerStats>> {
  const admin = createAdminClient();
  const ids = partners.map((p) => p.id);
  const out: Record<string, PartnerStats> = {};
  if (!ids.length) return out;

  const since30 = Date.now() - 30 * 86400000;
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    months.push(d.toISOString().slice(0, 7));
  }

  const [{ data: events }, { data: refs }, { data: pays }] = await Promise.all([
    admin.from("partner_events").select("partner_id, type, created_at").in("partner_id", ids).limit(100000),
    admin.from("profiles").select("referred_by, plan, created_at").in("referred_by", ids),
    admin.from("payments").select("partner_id, amount_pence, share_pence, created_at").in("partner_id", ids),
  ]);

  for (const p of partners) {
    out[p.id] = {
      views: 0, views30: 0, clicks: 0, clicks30: 0, visits: 0, visits30: 0,
      signups: 0, paying: 0, revenuePence: 0, commissionPence: 0,
      monthly: months.map((month) => ({ month, clicks: 0, visits: 0, signups: 0, revenuePence: 0, sharePence: 0 })),
    };
  }
  const bucket = (s: PartnerStats, iso: string) => s.monthly.find((m) => m.month === iso.slice(0, 7));

  for (const e of events ?? []) {
    const s = out[e.partner_id];
    if (!s) continue;
    const recent = new Date(e.created_at).getTime() >= since30;
    const b = bucket(s, e.created_at);
    if (e.type === "directory_view") { s.views++; if (recent) s.views30++; }
    if (e.type === "click") { s.clicks++; if (recent) s.clicks30++; if (b) b.clicks++; }
    if (e.type === "referral_visit") { s.visits++; if (recent) s.visits30++; if (b) b.visits++; }
  }
  for (const r of refs ?? []) {
    const s = out[r.referred_by as string];
    if (!s) continue;
    s.signups++;
    if (r.plan && r.plan !== "free") s.paying++;
    const b = bucket(s, r.created_at);
    if (b) b.signups++;
  }
  for (const pay of pays ?? []) {
    const s = out[pay.partner_id as string];
    if (!s) continue;
    s.revenuePence += pay.amount_pence;
    s.commissionPence += pay.share_pence ?? 0;
    const b = bucket(s, pay.created_at);
    if (b) {
      b.revenuePence += pay.amount_pence;
      b.sharePence += pay.share_pence ?? 0;
    }
  }
  return out;
}

export const PARTNER_TYPES: Record<string, string> = {
  solicitor: "Solicitor",
  will_writer: "Will writer",
  funeral_director: "Funeral director",
  insurer: "Insurer",
  financial_adviser: "Financial adviser",
  hospice: "Hospice",
  other: "Other",
};
