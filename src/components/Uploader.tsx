"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, VAULT_BUCKET } from "@/lib/supabase/client";
import { abandonKeepsake, finishKeepsake, startKeepsake } from "@/app/vault/actions";
import { CategoryPicker } from "./CategoryPicker";
import type { Category } from "@/lib/keepsake-types";

const MAX_BYTES = 25 * 1024 * 1024;
const DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export function Uploader() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("legacy");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pick(f: File | null) {
    setError(null);
    if (!f) return setFile(null);
    if (f.size > MAX_BYTES) return setError("That file is over 25 MB. Please choose a smaller one.");
    if (f.type.startsWith("video/")) {
      return setError("Videos need to be recorded inside KeepNear so they never sit in your phone's photos.");
    }
    if (!f.type.startsWith("image/") && !DOC_TYPES.includes(f.type)) {
      return setError("Please choose a photo, a PDF or a Word document.");
    }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, "").slice(0, 120));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setError(null);
    const kind = file.type.startsWith("image/") ? "photo" : "document";
    const started = await startKeepsake({ kind, title, mimeType: file.type, sizeBytes: file.size });
    if ("error" in started) {
      setBusy(false);
      return setError(started.error);
    }
    const { error: upErr } = await createClient()
      .storage.from(VAULT_BUCKET)
      .upload(started.path, file, { contentType: file.type, upsert: false });
    if (upErr) {
      await abandonKeepsake(started.id);
      setBusy(false);
      return setError("The upload didn't finish. Please try again.");
    }
    await finishKeepsake(started.id);
    router.push(`/vault/${started.id}?new=1&type=${category}`);
  }

  return (
    <form onSubmit={save} className="card flex flex-col gap-4">
      <label className="flex flex-col gap-1 font-bold">
        Choose a photo or document
        <input
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          onChange={(e) => pick(e.target.files?.[0] ?? null)}
          className="field font-normal"
        />
      </label>
      {file && (
        <label className="flex flex-col gap-1 font-bold">
          Title
          <input
            className="field font-normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            required
          />
        </label>
      )}
      {file && <CategoryPicker value={category} onChange={setCategory} />}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <button type="submit" className="btn self-start" disabled={!file || busy}>
        {busy ? "Saving to your vault…" : "Save to vault"}
      </button>
      <p className="text-xs text-muted">Photos, PDFs and Word documents up to 25 MB.</p>
    </form>
  );
}
