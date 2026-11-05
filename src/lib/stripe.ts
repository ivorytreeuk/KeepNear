import "server-only";
import Stripe from "stripe";
import { getPlan, type Interval, type PlanId } from "./plans";

let client: Stripe | null = null;

export function stripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set.");
  client ??= new Stripe(key);
  return client;
}

export function paymentsEnabled() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export type BillingChoice = { plan: PlanId; interval: Interval | "lifetime" };

function lookupKey(c: BillingChoice) {
  return `keepnear_${c.plan}_${c.interval}`;
}

/**
 * Finds the Stripe price for a plan, creating the product and price the first time.
 * This means nothing has to be set up by hand in the Stripe dashboard.
 */
export async function priceFor(c: BillingChoice): Promise<string> {
  const s = stripe();
  const key = lookupKey(c);
  const found = await s.prices.list({ lookup_keys: [key], active: true, limit: 1 });
  if (found.data[0]) return found.data[0].id;

  const plan = getPlan(c.plan);
  const amount = c.interval === "lifetime" ? plan.pence.lifetime : plan.pence[c.interval];
  if (!amount) throw new Error(`No price for ${key}`);

  const product = await s.products.create({
    name: `KeepNear ${plan.name}${c.interval === "lifetime" ? "" : c.interval === "annual" ? " (yearly)" : " (monthly)"}`,
    metadata: { plan: plan.id },
  });
  const price = await s.prices.create({
    product: product.id,
    currency: "gbp",
    unit_amount: amount,
    lookup_key: key,
    metadata: { plan: plan.id, interval: c.interval },
    ...(c.interval === "lifetime"
      ? {}
      : { recurring: { interval: c.interval === "annual" ? "year" : "month" } }),
  });
  return price.id;
}

export function siteUrl(requestOrigin?: string) {
  return (process.env.NEXT_PUBLIC_SITE_URL || requestOrigin || "http://localhost:3000").replace(/\/$/, "");
}
