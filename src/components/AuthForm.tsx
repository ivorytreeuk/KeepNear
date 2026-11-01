"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "./Logo";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/vault";
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${origin}/auth/callback?next=/vault`,
        },
      });
      setBusy(false);
      if (error) return setError(error.message);
      if (data.session) return router.push("/vault");
      return setMessage("Check your email and tap the link to confirm your account.");
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setError("That email and password don't match. Please try again.");
    router.push(next);
    router.refresh();
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
          {mode === "signup"
            ? "Free to start. Your first video is on us."
            : "Log in to your KeepNear vault."}
        </p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
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
          </label>

          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          {message && <p role="status" className="rounded-xl bg-cream p-3 text-sm">{message}</p>}

          <button type="submit" className="btn mt-2" disabled={busy}>
            {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {mode === "signup" ? (
            <>Already have a vault? <Link href="/login" className="font-bold text-plum underline">Log in</Link></>
          ) : (
            <>New to KeepNear? <Link href="/signup" className="font-bold text-plum underline">Create an account</Link></>
          )}
        </p>
      </div>
    </main>
  );
}
