"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState<"checking" | "ok" | "expired">("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setReady(data.user ? "ok" : "expired"));
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));
    if (password !== String(form.get("confirm"))) return setError("The two passwords don't match.");
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      if (/aal2|assurance|mfa/i.test(error.message)) {
        router.push("/login/verify?next=/reset-password");
        return;
      }
      return setError(error.message);
    }
    router.push("/vault/settings?saved=password");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-8 self-center" aria-label="KeepNear home">
        <Logo size={44} />
      </Link>
      <div className="card">
        <h1 className="text-2xl font-extrabold text-plum">Choose a new password</h1>
        {ready === "checking" && <p className="mt-4 text-muted">One moment…</p>}
        {ready === "expired" && (
          <div className="mt-4 flex flex-col gap-3">
            <p>This reset link has expired or has already been used.</p>
            <Link href="/forgot-password" className="btn">Send a new link</Link>
          </div>
        )}
        {ready === "ok" && (
          <form onSubmit={submit} className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-1 font-bold">
              New password
              <input name="password" type="password" required minLength={8} autoComplete="new-password" className="field font-normal" />
              <span className="text-xs font-normal text-muted">At least 8 characters.</span>
            </label>
            <label className="flex flex-col gap-1 font-bold">
              Type it again
              <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className="field font-normal" />
            </label>
            {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            <button type="submit" className="btn" disabled={busy}>{busy ? "Saving…" : "Save new password"}</button>
          </form>
        )}
      </div>
    </main>
  );
}
