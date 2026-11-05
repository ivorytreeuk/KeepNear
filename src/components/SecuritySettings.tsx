"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Factor = { id: string; friendly_name?: string; status: string; created_at: string };
type Passkey = { id: string; friendly_name?: string; created_at: string; last_used_at?: string };

function fmtDate(s?: string) {
  return s ? new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
}

function Note({ kind, children }: { kind: "ok" | "error"; children: React.ReactNode }) {
  return (
    <p
      role={kind === "error" ? "alert" : "status"}
      className={`rounded-xl p-3 text-sm ${kind === "error" ? "bg-red-50 text-red-800" : "bg-cream"}`}
    >
      {children}
    </p>
  );
}

/* ───────── Password ───────── */
function PasswordSection() {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const pw = String(form.get("password"));
    const confirm = String(form.get("confirm"));
    if (pw !== confirm) return setNote({ kind: "error", text: "The two passwords don't match." });
    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setNote({ kind: "error", text: error.message });
    formEl.reset();
    setNote({ kind: "ok", text: "Password changed." });
  }

  return (
    <form onSubmit={submit} className="card flex flex-col gap-4" aria-labelledby="pw-h">
      <h3 id="pw-h" className="text-lg font-extrabold text-plum">Change password</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 font-bold">
          New password
          <input name="password" type="password" minLength={8} required autoComplete="new-password" className="field font-normal" />
        </label>
        <label className="flex flex-col gap-1 font-bold">
          Type it again
          <input name="confirm" type="password" minLength={8} required autoComplete="new-password" className="field font-normal" />
        </label>
      </div>
      {note && <Note kind={note.kind}>{note.text}</Note>}
      <button type="submit" className="btn self-start" disabled={busy}>
        {busy ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}

/* ───────── Authenticator app (two-step verification) ───────── */
function TwoFactorSection({ onChange }: { onChange: () => void }) {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [enrolling, setEnrolling] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    const { data } = await createClient().auth.mfa.listFactors();
    setFactors((data?.totp ?? []) as Factor[]);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function start() {
    setBusy(true);
    setNote(null);
    const supabase = createClient();
    // Clear any half-finished set-up first, so starting again always works.
    const { data: all } = await supabase.auth.mfa.listFactors();
    for (const f of (all?.all ?? []) as Factor[]) {
      if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `Authenticator ${new Date().toISOString().slice(0, 16)}`,
      issuer: "KeepNear",
    });
    setBusy(false);
    if (error || !data) return setNote({ kind: "error", text: "Couldn't start set-up. Please try again." });
    setEnrolling({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!enrolling) return;
    setBusy(true);
    const { error } = await createClient().auth.mfa.challengeAndVerify({ factorId: enrolling.id, code: code.trim() });
    setBusy(false);
    if (error) return setNote({ kind: "error", text: "That code didn't match. Try the newest code in your app." });
    setEnrolling(null);
    setCode("");
    setNote({ kind: "ok", text: "Two-step verification is on. You'll be asked for a code when you log in." });
    await load();
    onChange();
  }

  async function remove(id: string) {
    if (!confirm("Turn off two-step verification? Your vault will only be protected by your password.")) return;
    setBusy(true);
    const { error } = await createClient().auth.mfa.unenroll({ factorId: id });
    setBusy(false);
    if (error) return setNote({ kind: "error", text: error.message });
    setNote({ kind: "ok", text: "Two-step verification is off." });
    await load();
    onChange();
  }

  const on = factors.length > 0;

  return (
    <section className="card flex flex-col gap-4" aria-labelledby="mfa-h">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="mfa-h" className="text-lg font-extrabold text-plum">Two-step verification</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${on ? "bg-plum text-cream" : "bg-cream text-muted"}`}>
          {on ? "On" : "Off"}
        </span>
      </div>
      <p className="text-sm">
        After your password, we&apos;ll ask for a 6-digit code from an app on your phone, such as Google Authenticator or
        Microsoft Authenticator. Someone who learns your password still can&apos;t get in.
      </p>

      {on &&
        factors.map((f) => (
          <div key={f.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line p-3">
            <span className="text-sm">Authenticator app · added {fmtDate(f.created_at)}</span>
            <button type="button" onClick={() => remove(f.id)} disabled={busy} className="min-h-11 rounded-full px-3 text-sm font-bold text-red-800 hover:bg-red-50">
              Turn off
            </button>
          </div>
        ))}

      {!on && !enrolling && (
        <button type="button" onClick={start} disabled={busy} className="btn self-start">
          {busy ? "Starting…" : "Turn on two-step verification"}
        </button>
      )}

      {enrolling && (
        <form onSubmit={verify} className="flex flex-col gap-4 rounded-2xl bg-cream p-4">
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            <li>Open your authenticator app and tap <strong>+</strong> or <strong>Add account</strong>.</li>
            <li>Scan this QR code. On this phone? Copy the set-up key below into the app instead.</li>
            <li>Type the 6-digit code it shows.</li>
          </ol>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enrolling.qr} alt="QR code to add KeepNear to your authenticator app" width={180} height={180} className="self-center rounded-xl bg-white p-2" />
          <p className="break-all text-center text-xs">
            Set-up key: <code className="font-bold">{enrolling.secret}</code>
          </p>
          <label className="flex flex-col gap-1 font-bold">
            6-digit code
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              className="field text-center text-xl font-extrabold tracking-[0.3em]"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn" disabled={busy || code.length !== 6}>Confirm and turn on</button>
            <button type="button" className="btn-outline" onClick={() => setEnrolling(null)}>Cancel</button>
          </div>
        </form>
      )}

      {note && <Note kind={note.kind}>{note.text}</Note>}
    </section>
  );
}

/* ───────── Passkeys ───────── */
function PasskeySection({ onChange }: { onChange: () => void }) {
  const [keys, setKeys] = useState<Passkey[]>([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [supported, setSupported] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await createClient().auth.passkey.list();
    if (!error) setKeys((data ?? []) as Passkey[]);
  }, []);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "PublicKeyCredential" in window);
    load();
  }, [load]);

  async function add() {
    setBusy(true);
    setNote(null);
    const { error } = await createClient().auth.registerPasskey();
    setBusy(false);
    if (error) {
      return setNote({
        kind: "error",
        text: "We couldn't add a passkey. If you cancelled, that's fine. Otherwise passkeys may not be switched on for this site yet.",
      });
    }
    setNote({ kind: "ok", text: "Passkey added. Next time, tap “Log in with a passkey”." });
    await load();
    onChange();
  }

  async function remove(id: string) {
    if (!confirm("Remove this passkey? You can still log in with your password.")) return;
    setBusy(true);
    const { error } = await createClient().auth.passkey.delete({ passkeyId: id });
    setBusy(false);
    if (error) return setNote({ kind: "error", text: error.message });
    await load();
    onChange();
  }

  return (
    <section className="card flex flex-col gap-4" aria-labelledby="pk-h">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="pk-h" className="text-lg font-extrabold text-plum">Passkeys</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${keys.length ? "bg-plum text-cream" : "bg-cream text-muted"}`}>
          {keys.length ? `${keys.length} added` : "None yet"}
        </span>
      </div>
      <p className="text-sm">
        Log in with Face ID, your fingerprint or your phone&apos;s PIN instead of typing a password. Passkeys can&apos;t be
        guessed, leaked or phished.
      </p>

      {keys.map((k) => (
        <div key={k.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line p-3">
          <span className="text-sm">
            {k.friendly_name || "Passkey"} · added {fmtDate(k.created_at)}
            {k.last_used_at && <span className="text-muted"> · last used {fmtDate(k.last_used_at)}</span>}
          </span>
          <button type="button" onClick={() => remove(k.id)} disabled={busy} className="min-h-11 rounded-full px-3 text-sm font-bold text-red-800 hover:bg-red-50">
            Remove
          </button>
        </div>
      ))}

      {supported ? (
        <button type="button" onClick={add} disabled={busy} className="btn self-start">
          {busy ? "Waiting for your device…" : keys.length ? "Add another passkey" : "Add a passkey"}
        </button>
      ) : (
        <p className="text-sm text-muted">This browser doesn&apos;t support passkeys. Try Safari, Chrome or Edge.</p>
      )}
      {note && <Note kind={note.kind}>{note.text}</Note>}
    </section>
  );
}

export function SecuritySettings() {
  const [, bump] = useState(0);
  const refresh = () => bump((n) => n + 1);
  return (
    <div className="flex flex-col gap-4">
      <PasskeySection onChange={refresh} />
      <TwoFactorSection onChange={refresh} />
      <PasswordSection />
    </div>
  );
}
