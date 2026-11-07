import Link from "next/link";
import { adminGate } from "@/lib/admin-auth";
import { lockAdmin, signOutToStaff } from "./actions";
import { UnlockForm } from "./UnlockForm";
import { Logo } from "@/components/Logo";
import { IdleLogout } from "@/components/IdleLogout";

export const metadata = { title: "Admin · KeepNear", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, signedInEmail, listEmpty, unlocked, configured } = await adminGate();

  if (!user) {
    return (
      <div className="min-h-screen bg-plum-dark">
        <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
          <div className="mb-6 self-center"><Logo size={40} light /></div>
          <div className="card flex flex-col gap-3">
            <h1 className="text-2xl font-extrabold text-plum">This account isn&apos;t a staff account</h1>
            <p>
              You&apos;re logged in as <strong>{signedInEmail}</strong>.
            </p>
            <p className="text-sm text-muted">
              {listEmpty
                ? "ADMIN_EMAILS isn't set up in Vercel yet (or isn't ticked for Production). Add it, then redeploy."
                : "If this should be an admin account, ADMIN_EMAILS in Vercel must contain this exact email. Fix it, then redeploy."}
            </p>
            <form action={signOutToStaff}>
              <button type="submit" className="btn w-full">Log out and use a different account</button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  if (!configured) {
    return (
      <main className="mx-auto max-w-md px-4 py-20">
        <div className="card">
          <h1 className="text-2xl font-extrabold text-plum">Admin passcode not set up</h1>
          <p className="mt-2">
            Add an <code>ADMIN_PASSCODE</code> environment variable in Vercel (at least 8 characters, marked
            Sensitive), then redeploy.
          </p>
        </div>
      </main>
    );
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-plum-dark">
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
        <div className="mb-4 self-center"><Logo size={40} light /></div>
        <p className="mb-6 self-center rounded-full bg-cream/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-cream">Admin</p>
        <UnlockForm email={user.email ?? ""} />
      </main>
      </div>
    );
  }

  const nav = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/people", label: "People and releases" },
    { href: "/admin/partners", label: "Partners" },
  ];

  return (
    <div className="min-h-screen">
      <IdleLogout />
      <header className="border-b border-line bg-plum text-cream">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Logo size={28} light />
            <span className="rounded-full bg-cream/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider">Admin</span>
          </div>
          <nav className="flex flex-wrap items-center gap-1 text-sm font-bold">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-full px-3 py-2 hover:bg-cream/15">{n.label}</Link>
            ))}
            <Link href="/vault" className="rounded-full px-3 py-2 hover:bg-cream/15">My vault</Link>
            <form action={lockAdmin}>
              <button type="submit" className="rounded-full px-3 py-2 opacity-80 hover:bg-cream/15">Lock</button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
