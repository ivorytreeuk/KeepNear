"use client";

import { useActionState } from "react";
import { unlockAdmin } from "./actions";

export function UnlockForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(unlockAdmin, null);
  return (
    <form action={action} className="card flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold text-plum">Admin passcode</h1>
      <p className="text-sm text-muted">Signed in as {email}. Enter the admin passcode to open the dashboard.</p>
      <label className="flex flex-col gap-1 font-bold">
        Admin passcode
        <input name="passcode" type="password" required autoComplete="current-password" autoFocus className="field font-normal" />
      </label>
      {state?.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{state.error}</p>}
      <button type="submit" className="btn" disabled={pending}>{pending ? "Checking…" : "Unlock"}</button>
    </form>
  );
}
