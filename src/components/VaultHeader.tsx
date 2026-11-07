import Link from "next/link";
import { Logo } from "./Logo";
import { signOut } from "@/app/vault/actions";
import { IdleLogout } from "./IdleLogout";

export function VaultHeader() {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/vault" aria-label="KeepNear home">
          <Logo size={32} />
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm font-bold text-plum">
          <Link href="/vault" className="rounded-full px-3 py-2 hover:bg-cream">Vault</Link>
          <Link href="/vault/recipients" className="rounded-full px-3 py-2 hover:bg-cream">Recipients</Link>
          <Link href="/vault/release-holder" className="rounded-full px-3 py-2 hover:bg-cream">Release holder</Link>
          <Link href="/vault/plan" className="rounded-full px-3 py-2 hover:bg-cream">My plan</Link>
          <Link href="/vault/settings" className="rounded-full px-3 py-2 hover:bg-cream">Settings</Link>
          <form action={signOut}>
            <button type="submit" className="rounded-full px-3 py-2 text-muted hover:bg-cream">Log out</button>
          </form>
        </nav>
      </div>
    </header>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <VaultHeader />
      <IdleLogout />
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </>
  );
}
