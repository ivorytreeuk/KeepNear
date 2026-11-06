"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SECURITY_QUESTIONS } from "@/lib/security-questions";

export function SecurityQuestionForm({ current }: { current: string | null }) {
  const [question, setQuestion] = useState(current);
  const [editing, setEditing] = useState(!current);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const q = String(form.get("question"));
    const a = String(form.get("answer"));
    setBusy(true);
    const { error } = await createClient().rpc("set_my_security_answer", { p_question: q, p_answer: a });
    setBusy(false);
    if (error) return setNote({ ok: false, text: "Couldn't save that. Please try again." });
    setQuestion(q);
    setEditing(false);
    setNote({ ok: true, text: "Security question saved." });
  }

  return (
    <section className="card flex flex-col gap-4" aria-labelledby="sq-h">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="sq-h" className="text-lg font-extrabold text-plum">Security question</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${question ? "bg-plum text-cream" : "bg-cream text-muted"}`}>
          {question ? "Set" : "Not set"}
        </span>
      </div>
      <p className="text-sm">
        If you ever contact us after losing access to your account, we&apos;ll ask this to check it&apos;s really you.
        Your answer is stored scrambled, so nobody can read it, including us.
      </p>

      {question && !editing && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line p-3">
          <span className="text-sm">{question}</span>
          <button type="button" onClick={() => setEditing(true)} className="min-h-11 rounded-full px-3 text-sm font-bold text-plum hover:bg-cream">
            Change
          </button>
        </div>
      )}

      {editing && (
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 font-bold sm:col-span-2">
            Question
            <select name="question" required defaultValue={question ?? ""} className="field font-normal">
              <option value="" disabled>Choose a question…</option>
              {SECURITY_QUESTIONS.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 font-bold sm:col-span-2">
            Your answer
            <input name="answer" required minLength={2} maxLength={100} autoComplete="off" className="field font-normal" />
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
            {question && (
              <button type="button" className="btn-outline" onClick={() => setEditing(false)}>Cancel</button>
            )}
          </div>
        </form>
      )}

      {note && (
        <p role={note.ok ? "status" : "alert"} className={`rounded-xl p-3 text-sm ${note.ok ? "bg-cream" : "bg-red-50 text-red-800"}`}>
          {note.text}
        </p>
      )}
    </section>
  );
}
