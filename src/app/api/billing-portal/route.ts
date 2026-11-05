import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { paymentsEnabled, siteUrl, stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const base = siteUrl(new URL(request.url).origin);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${base}/login`, 303);

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!paymentsEnabled() || !profile?.stripe_customer_id) {
    return NextResponse.redirect(`${base}/vault/settings`, 303);
  }

  const session = await stripe().billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${base}/vault/settings`,
  });
  return NextResponse.redirect(session.url, 303);
}
