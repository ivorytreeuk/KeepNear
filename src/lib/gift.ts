import "server-only";
import { createAdminClient } from "./supabase/admin";

export const GIFT_AMOUNTS = [25000, 50000];
export const GIFT_FIRST_YEAR_RATE = 20;
export const GIFT_ONGOING_RATE = 10;
export const COMMISSION_MONTHS = 24;

export const PAYS_FOR = [
  "Funeral director fees",
  "Flowers",
  "Wake or venue",
  "Headstone or memorial",
  "Order of service",
  "Travel for family",
  "Other",
];

export type Reward = "gift" | "commission";

export function rewardForType(type: string): Reward {
  return ["insurer", "financial_adviser", "will_writer"].includes(type) ? "commission" : "gift";
}

/** The partner's share (in pence) of one payment, by reward type and how long the client has been with us. */
export function shareFor(amountPence: number, reward: Reward, commissionRate: number, clientSince: Date, paidAt = new Date()) {
  const days = (paidAt.getTime() - clientSince.getTime()) / 86400000;
  if (reward === "gift") return Math.round((amountPence * (days < 365 ? GIFT_FIRST_YEAR_RATE : GIFT_ONGOING_RATE)) / 100);
  return days < COMMISSION_MONTHS * 30.44 ? Math.round((amountPence * commissionRate) / 100) : 0;
}

export type GiftAward = {
  id: string;
  partner_id: string | null;
  family_label: string;
  situation: string | null;
  pays_for: string;
  amount_pence: number;
  supplier_name: string;
  supplier_details: string | null;
  consent: boolean;
  status: "pending" | "approved" | "paid" | "declined";
  admin_note: string | null;
  created_at: string;
  decided_at: string | null;
  paid_at: string | null;
};

/** The whole KeepNear Gift: money in, money out, what's left, and each partner's part in it. */
export async function giftFund() {
  const admin = createAdminClient();
  const { data: partners } = await admin.from("partners").select("id, name, slug, type, reward, active").eq("reward", "gift");
  const ids = (partners ?? []).map((p) => p.id);
  const [{ data: pays }, { data: awards }] = await Promise.all([
    ids.length ? admin.from("payments").select("partner_id, share_pence").in("partner_id", ids) : Promise.resolve({ data: [] as { partner_id: string; share_pence: number }[] }),
    admin.from("gift_awards").select("*").order("created_at", { ascending: false }),
  ]);
  const list = (awards ?? []) as GiftAward[];

  const byPartner: Record<string, { added: number; paid: number; committed: number; families: number }> = {};
  for (const id of ids) byPartner[id] = { added: 0, paid: 0, committed: 0, families: 0 };
  for (const p of pays ?? []) if (byPartner[p.partner_id as string]) byPartner[p.partner_id as string].added += p.share_pence;
  for (const a of list) {
    if (!a.partner_id || !byPartner[a.partner_id]) continue;
    if (a.status === "paid") {
      byPartner[a.partner_id].paid += a.amount_pence;
      byPartner[a.partner_id].families++;
    }
    if (a.status === "approved") byPartner[a.partner_id].committed += a.amount_pence;
  }

  const totalIn = Object.values(byPartner).reduce((t, x) => t + x.added, 0);
  const paid = list.filter((a) => a.status === "paid");
  const totalPaid = paid.reduce((t, a) => t + a.amount_pence, 0);
  const committed = list.filter((a) => a.status === "approved").reduce((t, a) => t + a.amount_pence, 0);

  return {
    partners: partners ?? [],
    byPartner,
    awards: list,
    totalIn,
    totalPaid,
    committed,
    available: totalIn - totalPaid - committed,
    familiesHelped: paid.length,
  };
}
