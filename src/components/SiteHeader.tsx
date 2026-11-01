import Link from "next/link";
import { Logo } from "./Logo";

export function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
      <Link href="/" aria-label="KeepNear home">
        <Logo size={36} />
      </Link>
      <nav className="flex flex-wrap items-center gap-2 font-bold">
        <Link href="/pricing" className="rounded-full px-3 py-2 text-plum hover:bg-white">Pricing</Link>
        <Link href="/login" className="rounded-full px-3 py-2 text-plum hover:bg-white">Log in</Link>
        <Link href="/signup" className="btn">Start free</Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-wrap justify-between gap-4 px-4 py-8 text-sm text-muted">
        <p>© {new Date().getFullYear()} KeepNear, a service of Ivory Tree Inc Ltd (company no. 14329140).</p>
        <a href="mailto:info@keepnear.co.uk" className="font-bold text-plum underline">info@keepnear.co.uk</a>
      </div>
    </footer>
  );
}
