"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

export default function ForgotPasswordPage() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const email = String(new FormData(e.currentTarget).get("email")).trim();
    const origin = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });
    setBusy(false);
    if (error && /rate|seconds/i.test(error.message)) {
      return setError("Please wait a minute before asking for another email.");
    }
    // Same message whether or not the account exists, so nobody can use this page to check who has an account.
    setSent(email);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-8 self-center" aria-label="KeepNear home">
        <Logo size={44} />
      </Link>
      <div className="card">
        <h1 className="text-2xl font-extrabold text-plum">Reset your password</h1>
        {sent ? (
          <div role="status" className="mt-4 flex flex-col gap-3">
            <p>
              If there&apos;s a KeepNear account for <strong>{sent}</strong>, we&apos;ve emailed a link to set a new
              password. It works for one hour.
            </p>
            <p className="text-sm text-muted">Nothing there after a few minutes? Check your spam folder.</p>
            <Link href="/login" className="btn-outline mt-2">Back to log in</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-4 flex flex-col gap-4">
            <p className="text-muted">Enter the email you signed up with and we&apos;ll send you a link to choose a new password.</p>
            <label className="flex flex-col gap-1 font-bold">
              Email
              <input name="email" type="email" required autoComplete="email" className="field font-normal" />
            </label>
            {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            <button type="submit" className="btn" disabled={busy}>{busy ? "Sending…" : "Email me a reset link"}</button>
            <Link href="/login" className="text-center text-sm font-bold text-plum underline">Back to log in</Link>
          </form>
        )}
      </div>
    </main>
  );
}
