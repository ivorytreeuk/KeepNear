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


/** Records money received so it can be traced back to the partner who referred the customer (for 24 months). */
async function recordPayment(id: string, userId: string | null, amountPence: number, currency: string, description: string) {
  if (!amountPence || amountPence <= 0) return;
  const admin = createAdminClient();
  let partnerId: string | null = null;
  if (userId) {
    const { data: p } = await admin.from("profiles").select("referred_by, created_at").eq("id", userId).maybeSingle();
    const withinTerm = p?.created_at && Date.now() - new Date(p.created_at).getTime() < 730 * 86400000;
    partnerId = withinTerm ? (p?.referred_by ?? null) : null;
  }
  await admin
    .from("payments")
    .upsert({ id, user_id: userId, partner_id: partnerId, amount_pence: amountPence, currency, description }, { onConflict: "id", ignoreDuplicates: true });
}


/** If the customer used a partner's discount code, credit that partner (unless a referral link already did). */
async function creditPartnerCode(s: Stripe, session: Stripe.Checkout.Session, userId: string) {
  try {
    const promoIds = (session.discounts ?? [])
      .map((d) => (typeof d.promotion_code === "string" ? d.promotion_code : d.promotion_code?.id))
      .filter((x): x is string => Boolean(x));
    if (!promoIds.length) return;
    const promo = await s.promotionCodes.retrieve(promoIds[0]);
    const code = promo.code?.toUpperCase();
    if (!code) return;
    const admin = createAdminClient();
    const { data: partner } = await admin.from("partners").select("id").ilike("promo_code", code).maybeSingle();
    if (!partner) return;
    await admin.from("profiles").update({ referred_by: partner.id }).eq("id", userId).is("referred_by", null);
    // A first payment may have been recorded a moment earlier, before we knew about the code.
    await admin.from("payments").update({ partner_id: partner.id }).eq("user_id", userId).is("partner_id", null);
  } catch {
    // Attribution must never break billing.
  }
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
      await creditPartnerCode(s, session, userId);

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
        await recordPayment(session.id, userId, session.amount_total ?? 0, session.currency ?? "gbp", "Lifetime plan");
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
    case "invoice.paid": {
      const inv = event.data.object as Stripe.Invoice;
      const customerId = typeof inv.customer === "string" ? inv.customer : inv.customer?.id ?? null;
      const userId = await findUserId(customerId, null);
      if (inv.id) await recordPayment(inv.id, userId, inv.amount_paid ?? 0, inv.currency ?? "gbp", inv.lines?.data?.[0]?.description ?? "Subscription");
      break;
    }
    case "charge.refunded": {
      // A refund takes back the partner's 20% (or Gift contribution) on that money.
      const charge = event.data.object as Stripe.Charge;
      const customerId = typeof charge.customer === "string" ? charge.customer : charge.customer?.id ?? null;
      const userId = await findUserId(customerId, null);
      if (!userId || !charge.amount_refunded) break;
      const admin = createAdminClient();
      const { data: last } = await admin
        .from("payments")
        .select("partner_id")
        .eq("user_id", userId)
        .gt("amount_pence", 0)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      // One row per charge, updated if it's refunded in more than one go.
      await admin.from("payments").upsert(
        {
          id: `refund_${charge.id}`,
          user_id: userId,
          partner_id: last?.partner_id ?? null,
          amount_pence: -charge.amount_refunded,
          currency: charge.currency ?? "gbp",
          description: "Refund",
        },
        { onConflict: "id" }
      );
      break;
    }
  }

  return NextResponse.json({ received: true });
}
