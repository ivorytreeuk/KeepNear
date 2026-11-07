import Link from "next/link";
import { adminGate } from "@/lib/admin-auth";
import { lockAdmin, unlockAdmin } from "./actions";
import { Logo } from "@/components/Logo";
import { IdleLogout } from "@/components/IdleLogout";

export const metadata = { title: "Admin · KeepNear", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, unlocked, configured } = await adminGate();

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
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
        <div className="mb-8 self-center"><Logo size={40} /></div>
        <form action={unlockAdmin} className="card flex flex-col gap-4">
          <h1 className="text-2xl font-extrabold text-plum">KeepNear admin</h1>
          <p className="text-sm text-muted">Signed in as {user.email}. Enter the admin passcode to continue.</p>
          <label className="flex flex-col gap-1 font-bold">
            Admin passcode
            <input name="passcode" type="password" required autoComplete="current-password" autoFocus className="field font-normal" />
          </label>
          <button type="submit" className="btn">Unlock</button>
        </form>
      </main>
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
