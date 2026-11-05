import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlan } from "@/lib/plans";

export const runtime = "nodejs";

const ACTIVE = new Set(["active", "trialing", "past_due"]);

async function findUserId(customerId: string | null, metaUserId?: string | null) {
  if (metaUserId) return metaUserId;
  if (!customerId) return null;
  const { data } = await createAdminClient()
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.id ?? null;
}

function planFromSubscription(sub: Stripe.Subscription) {
  const price = sub.items.data[0]?.price;
  const plan = getPlan(price?.metadata?.plan ?? sub.metadata?.plan);
  const interval = price?.recurring?.interval === "year" ? "annual" : "monthly";
  return { plan: plan.id, interval };
}

async function applySubscription(sub: Stripe.Subscription) {
  const admin = createAdminClient();
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const userId = await findUserId(customerId, sub.metadata?.user_id);
  if (!userId) return;

  const { data: profile } = await admin.from("profiles").select("plan").eq("id", userId).single();
  if (profile?.plan === "lifetime") return; // Lifetime is never downgraded by a subscription change.

  if (ACTIVE.has(sub.status)) {
    const { plan, interval } = planFromSubscription(sub);
    await admin
      .from("profiles")
      .update({ plan, plan_interval: interval, stripe_customer_id: customerId, stripe_subscription_id: sub.id })
      .eq("id", userId);
  } else {
    // Cancelled or unpaid: back to Free. Their keepsakes stay safe; they just can't add more.
    await admin
      .from("profiles")
      .update({ plan: "free", plan_interval: null, stripe_subscription_id: null })
      .eq("id", userId);
  }
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ error: "Not configured" }, { status: 400 });

  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, signature, secret);
  } catch {
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  const s = stripe();
  const admin = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
      const userId = await findUserId(customerId, session.metadata?.user_id ?? session.client_reference_id);
      if (!userId) break;

      if (session.mode === "payment" && session.metadata?.plan === "lifetime" && session.payment_status === "paid") {
        const { data: profile } = await admin
          .from("profiles")
          .select("stripe_subscription_id")
          .eq("id", userId)
          .single();
        if (profile?.stripe_subscription_id) {
          // They've bought Lifetime, so stop charging them monthly.
          await s.subscriptions.cancel(profile.stripe_subscription_id).catch(() => null);
        }
        await admin
          .from("profiles")
          .update({ plan: "lifetime", plan_interval: "lifetime", stripe_customer_id: customerId, stripe_subscription_id: null })
          .eq("id", userId);
      }

      if (session.mode === "subscription" && session.subscription) {
        const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
        const sub = await s.subscriptions.retrieve(subId);
        await applySubscription(sub);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await applySubscription(event.data.object as Stripe.Subscription);
      break;
  }

  return NextResponse.json({ received: true });
}
