"use client";

import Link from "next/link";
import { useState } from "react";
import { partnerSignUp } from "../actions";

const TYPES: [string, string][] = [
  ["solicitor", "Solicitor"],
  ["will_writer", "Will writer"],
  ["funeral_director", "Funeral director"],
  ["insurer", "Insurer"],
  ["financial_adviser", "Financial adviser"],
  ["hospice", "Hospice"],
  ["other", "Other"],
];

export function PartnerSignupForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ reference: string; email: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const input = Object.fromEntries(Array.from(form.entries()).map(([k, v]) => [k, String(v)]));
    try {
      const r = await partnerSignUp(input);
      if (r.existing) setError("There's already a KeepNear account with this email. Sign in instead, or reset the password.");
      else if (r.error) setError(r.error);
      else if (r.reference) setDone({ reference: r.reference, email: r.email ?? "" });
    } catch {
      setError("We couldn't reach KeepNear. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="card flex flex-col gap-4 text-center">
        <h1 className="text-2xl font-extrabold text-plum">You&apos;re registered</h1>
        <p>Your unique partner reference is</p>
        <p className="self-center rounded-2xl border-2 border-peach bg-cream px-6 py-3 font-mono text-3xl font-extrabold tracking-widest text-plum">
          {done.reference}
        </p>
        <p className="text-sm">
          We&apos;ve emailed it to <strong>{done.email}</strong>, marked as important. You can sign in with it or with your
          email.
        </p>
        <p className="rounded-xl bg-cream p-3 text-sm">
          <strong>Next:</strong> open the confirmation email we&apos;ve sent and tap the link. Then sign in. We&apos;ll add you
          to our directory once we&apos;ve checked your details, usually within two working days.
        </p>
        <Link href="/partner/login" className="btn">Go to partner sign-in</Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card flex flex-col gap-4 border-t-4 border-t-peach">
      <div>
        <h1 className="text-2xl font-extrabold text-plum">Register as a partner</h1>
        <p className="mt-1 text-muted">Free for firms. You&apos;ll get a unique partner reference by email.</p>
      </div>
      <label className="flex flex-col gap-1 font-bold">
        Organisation name
        <input name="organisation" required maxLength={120} autoComplete="organization" className="field font-normal" />
      </label>
      <label className="flex flex-col gap-1 font-bold">
        Type of organisation
        <select name="type" defaultValue="solicitor" className="field font-normal">
          {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 font-bold">
        Main contact&apos;s name
        <input name="contact_name" required maxLength={120} autoComplete="name" className="field font-normal" />
      </label>
      <label className="flex flex-col gap-1 font-bold">
        Company email
        <input name="email" type="email" required autoComplete="email" className="field font-normal" />
        <span className="text-xs font-normal text-muted">Use a shared address if several people will sign in, e.g. partners@yourfirm.co.uk.</span>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 font-bold">
          Phone (optional)
          <input name="phone" type="tel" autoComplete="tel" className="field font-normal" />
        </label>
        <label className="flex flex-col gap-1 font-bold">
          Website (optional)
          <input name="website" placeholder="https://" className="field font-normal" />
        </label>
      </div>
      <label className="flex flex-col gap-1 font-bold">
        Area you cover (optional)
        <input name="region" placeholder="e.g. Derbyshire and Staffordshire" className="field font-normal" />
      </label>
      <label className="flex flex-col gap-1 font-bold">
        Password
        <input name="password" type="password" required minLength={8} autoComplete="new-password" className="field font-normal" />
        <span className="text-xs font-normal text-muted">At least 8 characters.</span>
      </label>
      <label className="flex flex-col gap-1 font-bold">
        Type the password again
        <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className="field font-normal" />
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="agree" required className="mt-0.5 h-5 w-5 shrink-0" />
        <span>
          I agree to the <Link href="/legal/terms" target="_blank" className="font-bold text-plum underline">Terms of Use</Link> and
          have read the <Link href="/legal/privacy" target="_blank" className="font-bold text-plum underline">Privacy Policy</Link>.
        </span>
      </label>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <button type="submit" className="btn" disabled={busy}>{busy ? "Registering…" : "Register as a partner"}</button>
      <p className="text-center text-sm text-muted">
        Already registered? <Link href="/partner/login" className="font-bold text-plum underline">Partner sign-in</Link>
      </p>
    </form>
  );
}
