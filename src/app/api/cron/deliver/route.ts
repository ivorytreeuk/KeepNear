import { NextResponse } from "next/server";
import { runDaily } from "@/lib/delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Called once a day by Vercel Cron (see vercel.json). Protected by CRON_SECRET. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  try {
    const result = await runDaily();
    console.log("[cron] daily run", result);
    return NextResponse.json(result);
  } catch (e) {
    console.error("[cron] failed", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
