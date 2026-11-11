import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { needsSecondStep } from "@/lib/aal";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdminPath = path.startsWith("/admin");
  const isPartnerPath = path === "/partner" || (path.startsWith("/partner/") && path !== "/partner/login" && path !== "/partner/signup" && path !== "/partner/demo");
  const protectedPath = path.startsWith("/vault") || isAdminPath || isPartnerPath;

  if (!user && protectedPath) {
    const login = request.nextUrl.clone();
    login.pathname = isAdminPath ? "/login/admin" : isPartnerPath ? "/partner/login" : "/login";
    login.search = "";
    login.searchParams.set("next", path);
    return NextResponse.redirect(login);
  }

  // Two-step verification: if it's switched on, the code must be entered before the vault opens.
  if (user && protectedPath && (await needsSecondStep(supabase))) {
    const verify = request.nextUrl.clone();
    verify.pathname = "/login/verify";
    verify.search = "";
    verify.searchParams.set("next", path);
    return NextResponse.redirect(verify);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
