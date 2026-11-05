"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const TOPICS = [
  { id: "general", label: "A general question" },
  { id: "support", label: "Help with my account" },
  { id: "partner", label: "Partnering with KeepNear (solicitors, will writers, funeral directors, insurers)" },
  { id: "press", label: "Press and media" },
];

export function ContactForm({ defaultTopic }: { defaultTopic: string }) {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (form.get("website")) return setSent(true); // Spam trap: real people never fill this in.
    setBusy(true);
    setError(null);
    const { error } = await createClient()
      .from("contact_messages")
      .insert({
        full_name: String(form.get("full_name")).trim().slice(0, 120),
        email: String(form.get("email")).trim().slice(0, 200),
        topic: String(form.get("topic")),
        message: String(form.get("message")).trim().slice(0, 4000),
      });
    setBusy(false);
    if (error) return setError("Sorry, that didn't send. Please email info@keepnear.co.uk instead.");
    setSent(true);
  }

  if (sent) {
    return (
      <div role="status" className="card">
        <p className="text-lg font-bold text-plum">Thank you. Your message is with us.</p>
        <p className="mt-1 text-muted">We reply to every message, usually within two working days.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card grid gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1 font-bold">
        Your name
        <input name="full_name" required maxLength={120} autoComplete="name" className="field font-normal" />
      </label>
      <label className="flex flex-col gap-1 font-bold">
        Email
        <input name="email" type="email" required maxLength={200} autoComplete="email" className="field font-normal" />
      </label>
      <label className="flex flex-col gap-1 font-bold sm:col-span-2">
        What&apos;s it about?
        <select name="topic" defaultValue={defaultTopic} className="field font-normal">
          {TOPICS.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 font-bold sm:col-span-2">
        Message
        <textarea name="message" required rows={6} maxLength={4000} className="field font-normal" />
      </label>
      <label className="hidden" aria-hidden="true">
        Leave this empty
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800 sm:col-span-2">{error}</p>}
      <button type="submit" className="btn self-start" disabled={busy}>{busy ? "Sending…" : "Send message"}</button>
    </form>
  );
}
