import Link from "next/link";
import { Logo } from "./Logo";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  let loggedIn = false;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    loggedIn = Boolean(user);
  } catch {
    loggedIn = false;
  }

  return (
    <header className="border-b border-line/60 bg-cream">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link href="/" aria-label="KeepNear home">
          <Logo size={36} />
        </Link>
        <nav aria-label="Main" className="flex flex-wrap items-center gap-1 font-bold">
          <Link href="/about" className="rounded-full px-3 py-2 text-plum hover:bg-white">About</Link>
          <Link href="/pricing" className="rounded-full px-3 py-2 text-plum hover:bg-white">Pricing</Link>
          <Link href="/partners" className="rounded-full px-3 py-2 text-plum hover:bg-white">Partners</Link>
          <Link href="/contact" className="rounded-full px-3 py-2 text-plum hover:bg-white">Contact</Link>
          {loggedIn ? (
            <Link href="/vault" className="btn ml-1">My vault</Link>
          ) : (
            <>
              <Link href="/login" className="rounded-full px-3 py-2 text-plum hover:bg-white">Log in</Link>
              <Link href="/signup" className="btn ml-1">Start free</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 text-sm sm:grid-cols-3">
        <div>
          <Logo size={28} />
          <p className="mt-3 text-muted">Your words, kept near to the people you love.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-2 font-bold text-plum">
          <Link href="/about" className="hover:underline">About KeepNear</Link>
          <Link href="/pricing" className="hover:underline">Pricing</Link>
          <Link href="/contact" className="hover:underline">Contact us</Link>
          <Link href="/partners" className="hover:underline">Partner with us</Link>
          <Link href="/directory" className="hover:underline">Find a solicitor or funeral director</Link>
        </nav>
        <div className="text-muted">
          <p>
            <a href="mailto:info@keepnear.co.uk" className="font-bold text-plum underline">info@keepnear.co.uk</a>
          </p>
          <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-bold text-plum">
            <Link href="/legal/terms" className="hover:underline">Terms</Link>
            <Link href="/legal/privacy" className="hover:underline">Privacy</Link>
            <Link href="/legal/cookies" className="hover:underline">Cookies</Link>
          </p>
          <p className="mt-3">
            © {new Date().getFullYear()} KeepNear, a service of Ivory Tree Inc Ltd. Registered in England and Wales,
            company no. 14329140.
          </p>
        </div>
      </div>
    </footer>
  );
}
