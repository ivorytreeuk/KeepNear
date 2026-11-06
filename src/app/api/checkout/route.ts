import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlan, planRank, type PlanId } from "@/lib/plans";
import { paymentsEnabled, priceFor, siteUrl, stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    return await startCheckout(request);
  } catch (err) {
    const e = err as { type?: string; code?: string; message?: string };
    console.error("[checkout] failed:", e?.type, e?.code, e?.message);
    const base = siteUrl(new URL(request.url).origin);
    const reason = encodeURIComponent(String(e?.code || e?.type || "unknown").slice(0, 60));
    return NextResponse.redirect(`${base}/vault/plan?billing=error&reason=${reason}`, 303);
  }
}

async function startCheckout(request: Request) {
  const origin = new URL(request.url).origin;
  const base = siteUrl(origin);
  const form = await request.formData();
  const planId = String(form.get("plan") ?? "") as PlanId;
  const intervalRaw = String(form.get("interval") ?? "monthly");
  const plan = getPlan(planId);

  if (plan.id === "free" || plan.id !== planId) {
    return NextResponse.redirect(`${base}/pricing`, 303);
  }
  const interval = plan.id === "lifetime" ? "lifetime" : intervalRaw === "annual" ? "annual" : "monthly";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${base}/signup?next=/pricing`, 303);
  }

  if (!paymentsEnabled()) {
    return NextResponse.redirect(`${base}/pricing?soon=1`, 303);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_interval, stripe_customer_id, stripe_subscription_id")
    .eq("id", user.id)
    .single();

  if (profile?.plan === "lifetime") {
    return NextResponse.redirect(`${base}/vault/plan?billing=lifetime`, 303);
  }

  const s = stripe();
  const priceId = await priceFor({ plan: plan.id, interval });

  // Already subscribed and switching between monthly plans: change the existing subscription.
  if (interval !== "lifetime" && profile?.stripe_subscription_id) {
    const sub = await s.subscriptions.retrieve(profile.stripe_subscription_id);
    if (["active", "trialing", "past_due"].includes(sub.status)) {
      const item = sub.items.data[0];
      const upgrading = planRank(plan.id) > planRank(profile.plan);
      await s.subscriptions.update(sub.id, {
        items: [{ id: item.id, price: priceId }],
        proration_behavior: upgrading ? "always_invoice" : "create_prorations",
        metadata: { user_id: user.id, plan: plan.id },
      });
      // The webhook also does this; updating now means the user sees it straight away.
      await createAdminClient()
        .from("profiles")
        .update({ plan: plan.id, plan_interval: interval })
        .eq("id", user.id);
      return NextResponse.redirect(`${base}/vault/plan?billing=changed`, 303);
    }
  }

  // Reuse the Stripe customer if we have one, so card details and history stay together.
  let customerId = profile?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await s.customers.create({
      email: user.email,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await createAdminClient().from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }

  const session = await s.checkout.sessions.create({
    mode: interval === "lifetime" ? "payment" : "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { user_id: user.id, plan: plan.id, interval },
    ...(interval === "lifetime"
      ? { payment_intent_data: { metadata: { user_id: user.id, plan: plan.id } } }
      : { subscription_data: { metadata: { user_id: user.id, plan: plan.id } } }),
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    success_url: `${base}/vault/plan?billing=success`,
    cancel_url: `${base}/pricing?cancelled=1`,
  });

  return NextResponse.redirect(session.url!, 303);
}
