"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get("next");
  const next = raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/vault";
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const factor = factors?.totp?.[0];
    if (!factor) {
      router.push(next);
      return;
    }
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code: code.trim() });
    setBusy(false);
    if (error) return setError("That code didn't work. Codes change every 30 seconds, so try the newest one.");
    router.push(next);
    router.refresh();
  }

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-8 self-center" aria-label="KeepNear home">
        <Logo size={44} />
      </Link>
      <form onSubmit={submit} className="card flex flex-col gap-4">
        <h1 className="text-2xl font-extrabold text-plum">Enter your code</h1>
        <p className="text-muted">Open your authenticator app and type the 6-digit code for KeepNear.</p>
        <label className="flex flex-col gap-1 font-bold">
          6-digit code
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            required
            autoFocus
            className="field text-center text-2xl font-extrabold tracking-[0.4em]"
          />
        </label>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <button type="submit" className="btn" disabled={busy || code.length !== 6}>
          {busy ? "Checking…" : "Open my vault"}
        </button>
        <button type="button" onClick={signOut} className="text-sm font-bold text-muted underline">
          Use a different account
        </button>
        <p className="text-xs text-muted">
          Lost your phone? Email <a href="mailto:info@keepnear.co.uk" className="underline">info@keepnear.co.uk</a> from
          your account email and we&apos;ll help you back in.
        </p>
      </form>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
