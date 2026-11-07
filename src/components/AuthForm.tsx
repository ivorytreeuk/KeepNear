"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "./Logo";
import { SECURITY_QUESTIONS } from "@/lib/security-questions";
import { signUpAction } from "@/app/signup/actions";
import { partnerSignIn } from "@/app/partner/actions";

function safeNext(raw: string | null, fallback: string) {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : fallback;
}

export type AuthVariant = "customer" | "partner" | "admin";

const LOOK: Record<AuthVariant, { home: string; title: string; sub: string; badge?: string }> = {
  customer: { home: "/vault", title: "Welcome back", sub: "Log in to your KeepNear vault." },
  partner: {
    home: "/partner",
    title: "Partner sign-in",
    sub: "For solicitors, will writers, funeral directors and other KeepNear partners. See your referrals, clicks and earnings.",
    badge: "Partners",
  },
  admin: {
    home: "/admin",
    title: "Staff sign-in",
    sub: "KeepNear team only. After this you'll be asked for the admin passcode.",
    badge: "Admin",
  },
};

export function AuthForm({ mode, variant = "customer" }: { mode: "login" | "signup"; variant?: AuthVariant }) {
  const look = LOOK[variant];
  const isAdmin = variant === "admin";
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"), look.home);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [unconfirmed, setUnconfirmed] = useState<string | null>(null);
  const [signedUpEmail, setSignedUpEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    params.get("error") === "link" ? "That link has expired or was opened in a different browser. Please log in." : null
  );
  const idleNotice = params.get("reason") === "idle";

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
      const afterConfirm = params.get("next") ? next : "/vault/welcome";
      let result: Awaited<ReturnType<typeof signUpAction>>;
      try {
        result = await signUpAction({
          fullName: String(form.get("full_name") ?? ""),
          email,
          password,
          confirm: String(form.get("confirm") ?? ""),
          question: String(form.get("question") ?? ""),
          answer: String(form.get("answer") ?? ""),
          next: afterConfirm,
        });
      } catch {
        result = { error: "We couldn't reach KeepNear. Check your connection and try again." };
      }
      setBusy(false);
      if (result.error) return setError(result.error);
      if (result.existing) {
        return setError("There's already an account with this email. Please log in, or reset your password if you've forgotten it.");
      }
      if (result.session) {
        router.push(afterConfirm);
        router.refresh();
        return;
      }
      setSignedUpEmail(email);
      return setMessage(
        "Nearly there. We've sent you an email: tap the link inside to confirm your account. You can open it on any device. Nothing after a few minutes? Check your spam folder."
      );
    }

    if (variant === "partner") {
      let r: Awaited<ReturnType<typeof partnerSignIn>>;
      try {
        r = await partnerSignIn(email, password);
      } catch {
        r = { error: "We couldn't reach KeepNear. Check your connection and try again." };
      }
      setBusy(false);
      if (r.error) {
        if (r.unconfirmed && email.includes("@")) setUnconfirmed(email);
        return setError(r.error);
      }
      return afterLogin();
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      const code = (error as { code?: string }).code;
      if (code === "email_not_confirmed" || /not confirmed/i.test(error.message)) {
        setUnconfirmed(email);
        return setError("You haven't confirmed your email yet. Tap the link in the email we sent, or we can send a new one.");
      }
      return setError("That email and password don't match. Please try again.");
    }
    await afterLogin();
  }

  async function resendConfirmation() {
    if (!unconfirmed) return;
    setBusy(true);
    const origin = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error } = await createClient().auth.resend({
      type: "signup",
      email: unconfirmed,
      options: { emailRedirectTo: `${origin}/auth/callback?next=${variant === "partner" ? "/partner" : "/vault/welcome"}` },
    });
    setBusy(false);
    if (error) return setError("We couldn't send another email just now. Please wait a minute and try again.");
    setError(null);
    setMessage(`We've sent a new confirmation email to ${unconfirmed}. Check your inbox and spam folder.`);
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
    <div className={isAdmin ? "min-h-screen bg-plum-dark" : variant === "partner" ? "min-h-screen bg-gradient-to-b from-white to-cream" : ""}>
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <Link href={variant === "partner" ? "/partners" : "/"} className="mb-4 self-center" aria-label="KeepNear home">
        <Logo size={44} light={isAdmin} />
      </Link>
      {look.badge && (
        <p className={`mb-6 self-center rounded-full px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest ${isAdmin ? "bg-cream/15 text-cream" : "bg-plum text-cream"}`}>
          {look.badge}
        </p>
      )}
      {!look.badge && <div className="mb-4" />}
      <div className={`card ${variant === "partner" ? "border-t-4 border-t-peach" : ""}`}>
        <h1 className="text-2xl font-extrabold text-plum">
          {mode === "signup" ? "Create your vault" : look.title}
        </h1>
        <p className="mt-1 text-muted">
          {mode === "signup" ? "Free to start. Your first video is on us." : look.sub}
        </p>

        {idleNotice && mode === "login" && (
          <p role="status" className="mt-4 rounded-xl bg-cream p-3 text-sm">
            We logged you out after 15 minutes without activity, to keep {variant === "customer" ? "your vault" : "everything"} safe. Log in again to carry on.
          </p>
        )}

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
            <p className="my-4 text-center text-sm text-muted">{variant === "partner" ? "or use your email or reference" : "or use your email"}</p>
          </>
        )}

        <form onSubmit={onSubmit} className={`flex flex-col gap-4 ${mode === "signup" ? "mt-6" : ""}`}>
          {mode === "signup" && (
            <label className="flex flex-col gap-1 font-bold">
              Your full name
              <input name="full_name" required autoComplete="name" className="field font-normal" />
            </label>
          )}
          {variant === "partner" && mode === "login" ? (
            <label className="flex flex-col gap-1 font-bold">
              Company email or partner reference
              <input name="email" type="text" required autoComplete="username" placeholder="you@firm.co.uk or KNP-XXXXXX" className="field font-normal" />
            </label>
          ) : (
            <label className="flex flex-col gap-1 font-bold">
              Email
              <input name="email" type="email" required autoComplete="email" className="field font-normal" />
            </label>
          )}
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
          {mode === "login" && (
            <Link href="/forgot-password" className="-mt-2 self-end text-sm font-bold text-plum underline">
              Forgot your password?
            </Link>
          )}

          {mode === "signup" && (
            <>
              <label className="flex flex-col gap-1 font-bold">
                Type your password again
                <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className="field font-normal" />
              </label>

              <fieldset className="flex flex-col gap-3 rounded-2xl bg-cream p-4">
                <legend className="px-1 font-bold">Security question</legend>
                <p className="-mt-1 text-xs text-muted">
                  If you ever lose access to your account, we&apos;ll use this to check it&apos;s really you. Pick an answer
                  you&apos;ll remember but others couldn&apos;t look up.
                </p>
                <label className="flex flex-col gap-1 text-sm font-bold">
                  Question
                  <select name="question" required defaultValue="" className="field font-normal">
                    <option value="" disabled>Choose a question…</option>
                    {SECURITY_QUESTIONS.map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm font-bold">
                  Your answer
                  <input name="answer" required minLength={2} maxLength={100} autoComplete="off" className="field font-normal" />
                  <span className="text-xs font-normal text-muted">Not case-sensitive. Stored scrambled, so nobody can read it.</span>
                </label>
              </fieldset>
            </>
          )}

          {mode === "signup" && (
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" name="agree" required className="mt-0.5 h-5 w-5 shrink-0" />
              <span>
                I&apos;m 18 or over and I agree to the{" "}
                <Link href="/legal/terms" target="_blank" className="font-bold text-plum underline">Terms of Use</Link>. I&apos;ve read the{" "}
                <Link href="/legal/privacy" target="_blank" className="font-bold text-plum underline">Privacy Policy</Link>.
              </span>
            </label>
          )}

          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          {unconfirmed && mode === "login" && !message && (
            <button type="button" onClick={resendConfirmation} disabled={busy} className="btn-outline">
              Send me a new confirmation email
            </button>
          )}
          {message && <p role="status" className="rounded-xl bg-cream p-3 text-sm">{message}</p>}
          {signedUpEmail && mode === "signup" && (
            <Link href="/login?next=/vault/welcome" className="btn-outline">
              Confirmed on your phone? Log in here
            </Link>
          )}

          <button type="submit" className="btn mt-2" disabled={busy}>
            {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {mode === "signup" ? (
            <>Already have a vault? <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-bold text-plum underline">Log in</Link></>
          ) : variant === "admin" ? (
            <>Not staff? <Link href="/login" className="font-bold text-plum underline">Customer log in</Link></>
          ) : variant === "partner" ? (
            <>
              New partner? <Link href="/partner/signup" className="font-bold text-plum underline">Register your organisation</Link>
              <br />
              <span className="mt-2 inline-block">
                <Link href="/partners" className="font-bold text-plum underline">How partnering works</Link>
              </span>
              <br />
              <span className="mt-2 inline-block">
                Looking for your own vault? <Link href="/login" className="font-bold text-plum underline">Customer log in</Link>
              </span>
            </>
          ) : (
            <>
              New to KeepNear? <Link href="/signup" className="font-bold text-plum underline">Create an account</Link>
              <br />
              <span className="mt-2 inline-block">
                A partner firm? <Link href="/partner/login" className="font-bold text-plum underline">Partner sign-in</Link>
              </span>
            </>
          )}
        </p>
      </div>
    </main>
    </div>
  );
}
