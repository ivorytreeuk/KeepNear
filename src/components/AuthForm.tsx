"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "./Logo";

function safeNext(raw: string | null, fallback: string) {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : fallback;
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"), "/vault");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    params.get("error") === "link" ? "That link has expired or was opened in a different browser. Please log in." : null
  );

  async function afterLogin() {
    const supabase = createClient();
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (data?.nextLevel === "aal2" && data.currentLevel !== "aal2") {
      router.push(`/login/verify?next=${encodeURIComponent(next)}`);
    } else {
      router.push(next);
    }
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const supabase = createClient();

    if (mode === "signup") {
      const fullName = String(form.get("full_name") ?? "");
      const origin = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const afterConfirm = params.get("next") ? next : "/vault/welcome";
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(afterConfirm)}`,
        },
      });
      setBusy(false);
      if (error) return setError(error.message);
      if (data.session) return router.push(afterConfirm);
      return setMessage(
        "Nearly there. We've sent you an email: tap the link inside to confirm your account. Open it on this device if you can."
      );
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setError("That email and password don't match. Please try again.");
    await afterLogin();
  }

  async function passkeyLogin() {
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.signInWithPasskey();
    setBusy(false);
    if (error) {
      return setError(
        "We couldn't log you in with a passkey. If you haven't added one yet, log in with your password and add one in Settings."
      );
    }
    await afterLogin();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-8 self-center" aria-label="KeepNear home">
        <Logo size={44} />
      </Link>
      <div className="card">
        <h1 className="text-2xl font-extrabold text-plum">
          {mode === "signup" ? "Create your vault" : "Welcome back"}
        </h1>
        <p className="mt-1 text-muted">
          {mode === "signup" ? "Free to start. Your first video is on us." : "Log in to your KeepNear vault."}
        </p>

        {mode === "login" && (
          <>
            <button type="button" onClick={passkeyLogin} disabled={busy} className="btn-outline mt-6 w-full">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="9" cy="8" r="4" />
                <path d="M2 21v-1a6 6 0 0 1 10-4.5" />
                <circle cx="18" cy="15" r="2.5" />
                <path d="M18 17.5V22M18 20h2" />
              </svg>
              Log in with a passkey
            </button>
            <p className="my-4 text-center text-sm text-muted">or use your email</p>
          </>
        )}

        <form onSubmit={onSubmit} className={`flex flex-col gap-4 ${mode === "signup" ? "mt-6" : ""}`}>
          {mode === "signup" && (
            <label className="flex flex-col gap-1 font-bold">
              Your full name
              <input name="full_name" required autoComplete="name" className="field font-normal" />
            </label>
          )}
          <label className="flex flex-col gap-1 font-bold">
            Email
            <input name="email" type="email" required autoComplete="email" className="field font-normal" />
          </label>
          <label className="flex flex-col gap-1 font-bold">
            Password
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="field font-normal"
            />
            {mode === "signup" && <span className="text-xs font-normal text-muted">At least 8 characters.</span>}
          </label>

          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          {message && <p role="status" className="rounded-xl bg-cream p-3 text-sm">{message}</p>}

          <button type="submit" className="btn mt-2" disabled={busy}>
            {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {mode === "signup" ? (
            <>Already have a vault? <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-bold text-plum underline">Log in</Link></>
          ) : (
            <>New to KeepNear? <Link href="/signup" className="font-bold text-plum underline">Create an account</Link></>
          )}
        </p>
      </div>
    </main>
  );
}
