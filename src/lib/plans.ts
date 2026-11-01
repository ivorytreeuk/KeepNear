export type PlanId = "free" | "starter" | "plus" | "family" | "premium" | "lifetime";

export type Plan = {
  id: PlanId;
  name: string;
  monthly: string | null;
  annual: string | null;
  oneOff?: string;
  videos: number;
  videoMinutes: number;
  photos: number;
  documents: number;
  recipients: number; // Infinity = unlimited
  milestones: boolean;
};

export const PLANS: Plan[] = [
  { id: "free", name: "Free", monthly: "£0", annual: "£0", videos: 1, videoMinutes: 5, photos: 5, documents: 1, recipients: 1, milestones: false },
  { id: "starter", name: "Starter", monthly: "£2.99", annual: "£29", videos: 3, videoMinutes: 5, photos: 20, documents: 5, recipients: 3, milestones: false },
  { id: "plus", name: "Plus", monthly: "£4.99", annual: "£49", videos: 8, videoMinutes: 10, photos: 50, documents: 15, recipients: 6, milestones: true },
  { id: "family", name: "Family", monthly: "£7.99", annual: "£79", videos: 20, videoMinutes: 15, photos: 200, documents: 40, recipients: 15, milestones: true },
  { id: "premium", name: "Premium", monthly: "£11.99", annual: "£119", videos: 50, videoMinutes: 20, photos: 1000, documents: 100, recipients: Infinity, milestones: true },
  { id: "lifetime", name: "Lifetime", monthly: null, annual: null, oneOff: "£349 once", videos: 50, videoMinutes: 20, photos: 1000, documents: 100, recipients: Infinity, milestones: true },
];

export function getPlan(id: string | null | undefined): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

export type Kind = "video" | "photo" | "document";

export function limitFor(plan: Plan, kind: Kind): number {
  return kind === "video" ? plan.videos : kind === "photo" ? plan.photos : plan.documents;
}

export function fmtLimit(n: number) {
  return n === Infinity ? "Unlimited" : String(n);
}
