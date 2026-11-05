export type PlanId = "free" | "starter" | "plus" | "family" | "premium" | "lifetime";
export type Interval = "monthly" | "annual";

export type Plan = {
  id: PlanId;
  name: string;
  monthly: string | null;
  annual: string | null;
  oneOff?: string;
  /** Prices in pence, used for payments. */
  pence: { monthly?: number; annual?: number; lifetime?: number };
  videos: number;
  videoMinutes: number;
  photos: number;
  documents: number;
  recipients: number; // Infinity = unlimited
  milestones: boolean;
};

export const PLANS: Plan[] = [
  { id: "free", name: "Free", monthly: "£0", annual: "£0", pence: {}, videos: 1, videoMinutes: 5, photos: 5, documents: 1, recipients: 1, milestones: false },
  { id: "starter", name: "Starter", monthly: "£2.99", annual: "£29", pence: { monthly: 299, annual: 2900 }, videos: 3, videoMinutes: 5, photos: 20, documents: 5, recipients: 3, milestones: false },
  { id: "plus", name: "Plus", monthly: "£4.99", annual: "£49", pence: { monthly: 499, annual: 4900 }, videos: 8, videoMinutes: 10, photos: 50, documents: 15, recipients: 6, milestones: true },
  { id: "family", name: "Family", monthly: "£7.99", annual: "£79", pence: { monthly: 799, annual: 7900 }, videos: 20, videoMinutes: 15, photos: 200, documents: 40, recipients: 15, milestones: true },
  { id: "premium", name: "Premium", monthly: "£11.99", annual: "£119", pence: { monthly: 1199, annual: 11900 }, videos: 50, videoMinutes: 20, photos: 1000, documents: 100, recipients: Infinity, milestones: true },
  { id: "lifetime", name: "Lifetime", monthly: null, annual: null, oneOff: "£349 once", pence: { lifetime: 34900 }, videos: 50, videoMinutes: 20, photos: 1000, documents: 100, recipients: Infinity, milestones: true },
];

export function getPlan(id: string | null | undefined): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

/** The next plan up the ladder, or null at the top. */
export function nextPlan(id: string | null | undefined): Plan | null {
  const i = PLANS.findIndex((p) => p.id === getPlan(id).id);
  return i >= 0 && i < PLANS.length - 1 ? PLANS[i + 1] : null;
}

export function planRank(id: string | null | undefined) {
  return PLANS.findIndex((p) => p.id === getPlan(id).id);
}

export type Kind = "video" | "photo" | "document";

export function limitFor(plan: Plan, kind: Kind): number {
  return kind === "video" ? plan.videos : kind === "photo" ? plan.photos : plan.documents;
}

export function fmtLimit(n: number) {
  return n === Infinity ? "Unlimited" : String(n);
}
