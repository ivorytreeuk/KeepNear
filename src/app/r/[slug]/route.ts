import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** A partner's referral link. Remembers the partner for 90 days so a later sign-up is credited to them. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dest = request.nextUrl.searchParams.get("to") === "signup" ? "/signup" : "/";
  const res = NextResponse.redirect(new URL(dest, request.url));
  try {
    const admin = createAdminClient();
    const { data: p } = await admin.from("partners").select("id").eq("slug", slug).maybeSingle();
    if (p) {
      await admin.from("partner_events").insert({ partner_id: p.id, type: "referral_visit", source: request.nextUrl.searchParams.get("src")?.slice(0, 60) ?? null });
      res.cookies.set("kn_ref", p.id, { maxAge: 60 * 60 * 24 * 90, httpOnly: true, sameSite: "lax", secure: true, path: "/" });
    }
  } catch {
    // Tracking must never stop someone reaching the site.
  }
  return res;
}
