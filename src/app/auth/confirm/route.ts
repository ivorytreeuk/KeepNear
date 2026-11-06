import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const TYPES: EmailOtpType[] = ["signup", "email", "recovery", "invite", "magiclink", "email_change"];

/**
 * Handles links from KeepNear emails. Unlike the standard link, this works on any device,
 * so someone can sign up on a laptop and confirm on their phone.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const typeRaw = searchParams.get("type") as EmailOtpType | null;
  const nextRaw = searchParams.get("next") ?? "";
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "";

  if (tokenHash && typeRaw && TYPES.includes(typeRaw)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type: typeRaw, token_hash: tokenHash });
    if (!error) {
      if (typeRaw === "recovery") return NextResponse.redirect(`${origin}/reset-password`);
      const to = next || "/vault/welcome";
      return NextResponse.redirect(`${origin}/verified?next=${encodeURIComponent(to)}`);
    }
  }

  const reset = typeRaw === "recovery" ? "&for=reset" : "";
  return NextResponse.redirect(`${origin}/verified?status=invalid${reset}`);
}
