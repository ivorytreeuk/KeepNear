import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/vault";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/vault";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (next === "/reset-password") return NextResponse.redirect(`${origin}${next}`);
      return NextResponse.redirect(`${origin}/verified?next=${encodeURIComponent(next)}`);
    }
  }
  // Usually means the link was opened on a different device. The email is still confirmed.
  return NextResponse.redirect(`${origin}/verified?status=invalid`);
}
