import Link from "next/link";
import { SiteFooter, SiteHeader } from "./SiteHeader";
import { LEGAL } from "@/lib/legal";

const PAGES = [
  { href: "/legal/terms", label: "Terms of Use" },
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/cookies", label: "Cookie Policy" },
];

export function LegalLayout({
  title,
  intro,
  current,
  children,
}: {
  title: string;
  intro: string;
  current: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <nav aria-label="Legal" className="flex flex-wrap gap-2 text-sm font-bold">
          {PAGES.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              aria-current={p.href === current ? "page" : undefined}
              className={`rounded-full px-3 py-2 ${p.href === current ? "bg-plum text-cream" : "bg-white text-plum hover:bg-line"}`}
            >
              {p.label}
            </Link>
          ))}
        </nav>
        <h1 className="mt-6 text-4xl font-extrabold text-plum">{title}</h1>
        <p className="mt-2 text-sm text-muted">Last updated {LEGAL.updated}</p>
        <p className="mt-4 rounded-2xl bg-white p-4 text-lg">{intro}</p>
        <article className="legal">{children}</article>
        <p className="mt-12 rounded-2xl bg-white p-4 text-sm">
          Questions about this page? Email{" "}
          <a href={`mailto:${LEGAL.email}`} className="font-bold text-plum underline">{LEGAL.email}</a> or use our{" "}
          <Link href="/contact" className="font-bold text-plum underline">contact form</Link>.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
