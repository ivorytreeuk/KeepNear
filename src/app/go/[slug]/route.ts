import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Counts a click on a partner in the directory, then sends the visitor to their website. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const home = new URL("/directory", request.url);
  try {
    const admin = createAdminClient();
    const { data: p } = await admin.from("partners").select("id, website, active").eq("slug", slug).maybeSingle();
    if (!p?.website || !p.active) return NextResponse.redirect(home);
    let target: URL;
    try {
      target = new URL(/^https?:\/\//i.test(p.website) ? p.website : `https://${p.website}`);
    } catch {
      return NextResponse.redirect(home);
    }
    target.searchParams.set("utm_source", "keepnear");
    target.searchParams.set("utm_medium", "directory");
    await admin.from("partner_events").insert({ partner_id: p.id, type: "click", source: request.headers.get("referer")?.slice(0, 200) ?? null });
    return NextResponse.redirect(target);
  } catch {
    return NextResponse.redirect(home);
  }
}
