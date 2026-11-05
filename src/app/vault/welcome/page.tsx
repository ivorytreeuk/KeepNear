import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/VaultHeader";
import { LogoMark } from "@/components/Logo";

export const metadata = { title: "Welcome · KeepNear" };

export default async function WelcomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user!.id).single();
  const first = profile?.full_name?.split(" ")[0];

  return (
    <PageShell>
      <section className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-white shadow-sm">
          <LogoMark size={64} />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold text-plum">
          {first ? `Welcome, ${first}. Your vault is ready.` : "Your vault is ready."}
        </h1>
        <p className="mt-3 text-lg">
          Before you record anything, take one minute to lock it properly. What you put in here is meant for the people
          you love, and nobody else.
        </p>
      </section>

      <div className="mx-auto mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
        <div className="card flex flex-col">
          <span className="self-start rounded-full bg-peach px-3 py-1 text-xs font-extrabold text-plum-dark">Easiest</span>
          <h2 className="mt-2 text-lg font-extrabold text-plum">Add a passkey</h2>
          <p className="mt-1 flex-1 text-sm">Log in with Face ID or your fingerprint. Nothing to remember, nothing to steal.</p>
          <Link href="/vault/settings#security" className="btn mt-4">Set up a passkey</Link>
        </div>
        <div className="card flex flex-col">
          <h2 className="text-lg font-extrabold text-plum">Two-step verification</h2>
          <p className="mt-1 flex-1 text-sm">
            Add a 6-digit code from an authenticator app on top of your password.
          </p>
          <Link href="/vault/settings#security" className="btn-outline mt-4">Set up two-step</Link>
        </div>
      </div>

      <p className="mt-8 text-center">
        <Link href="/vault" className="font-bold text-muted underline">Skip for now, take me to my vault</Link>
      </p>
    </PageShell>
  );
}
