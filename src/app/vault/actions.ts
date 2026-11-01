"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPlan, limitFor, type Kind } from "@/lib/plans";

const BUCKET = "vault";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

function extFor(mime: string, fallback: string) {
  const map: Record<string, string> = {
    "video/mp4": "mp4",
    "video/webm": "webm",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/heic": "heic",
    "image/webp": "webp",
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  };
  return map[mime.split(";")[0]] ?? fallback;
}

/** Step 1 of saving: checks the plan limit, creates the record and returns where to upload. */
export async function startKeepsake(input: {
  kind: Kind;
  title: string;
  mimeType: string;
  sizeBytes: number;
  durationSeconds?: number;
}): Promise<{ id: string; path: string } | { error: string }> {
  const { supabase, user } = await requireUser();

  const title = input.title.trim().slice(0, 120);
  if (!title) return { error: "Please give this keepsake a title." };
  if (!["video", "photo", "document"].includes(input.kind)) return { error: "Unknown keepsake type." };

  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
  const plan = getPlan(profile?.plan);

  const { count } = await supabase
    .from("keepsakes")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id)
    .eq("kind", input.kind);

  if ((count ?? 0) >= limitFor(plan, input.kind)) {
    return { error: `Your ${plan.name} plan is full for ${input.kind}s. Upgrade to add more.` };
  }

  if (input.kind === "video" && (input.durationSeconds ?? 0) > plan.videoMinutes * 60 + 5) {
    return { error: `Videos on your plan can be up to ${plan.videoMinutes} minutes.` };
  }

  const id = crypto.randomUUID();
  const path = `${user.id}/${id}.${extFor(input.mimeType, "bin")}`;

  const { error } = await supabase.from("keepsakes").insert({
    id,
    owner_id: user.id,
    kind: input.kind,
    title,
    storage_path: path,
    mime_type: input.mimeType,
    size_bytes: input.sizeBytes,
    duration_seconds: input.durationSeconds ?? null,
  });
  if (error) return { error: "Couldn't save that. Please try again." };

  return { id, path };
}

/** Step 2 of saving: marks the keepsake ready once the file is in the vault. */
export async function finishKeepsake(id: string) {
  const { supabase, user } = await requireUser();
  await supabase.from("keepsakes").update({ status: "ready" }).eq("id", id).eq("owner_id", user.id);
  revalidatePath("/vault");
}

/** Removes a half-saved keepsake after a failed upload. */
export async function abandonKeepsake(id: string) {
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .from("keepsakes")
    .select("storage_path")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();
  if (data) await supabase.storage.from(BUCKET).remove([data.storage_path]);
  await supabase.from("keepsakes").delete().eq("id", id).eq("owner_id", user.id);
}

export async function deleteKeepsake(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  await abandonKeepsake(id);
  revalidatePath("/vault");
  redirect("/vault?deleted=1");
}

export async function saveKeepsakeSettings(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim().slice(0, 120);
  const note = String(formData.get("note") ?? "").trim().slice(0, 1000) || null;
  const releaseOn = formData.get("release_on") === "date" ? "date" : "after_death";
  const releaseDate = releaseOn === "date" ? String(formData.get("release_date") ?? "") || null : null;
  const recipientIds = formData.getAll("recipients").map(String);

  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
  const plan = getPlan(profile?.plan);
  const allowDate = plan.milestones && releaseOn === "date" && releaseDate;

  await supabase
    .from("keepsakes")
    .update({
      ...(title ? { title } : {}),
      note,
      release_on: allowDate ? "date" : "after_death",
      release_date: allowDate ? releaseDate : null,
    })
    .eq("id", id)
    .eq("owner_id", user.id);

  await supabase.from("keepsake_recipients").delete().eq("keepsake_id", id);
  if (recipientIds.length) {
    await supabase
      .from("keepsake_recipients")
      .insert(recipientIds.map((rid) => ({ keepsake_id: id, recipient_id: rid })));
  }

  revalidatePath(`/vault/${id}`);
  redirect(`/vault/${id}?saved=1`);
}

export async function addRecipient(formData: FormData) {
  const { supabase, user } = await requireUser();
  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!fullName) redirect("/vault/recipients?error=name");

  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
  const plan = getPlan(profile?.plan);
  const { count } = await supabase
    .from("recipients")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id);
  if ((count ?? 0) >= plan.recipients) redirect("/vault/recipients?error=limit");

  await supabase.from("recipients").insert({
    owner_id: user.id,
    full_name: fullName.slice(0, 120),
    email: String(formData.get("email") ?? "").trim() || null,
    relationship: String(formData.get("relationship") ?? "").trim() || null,
  });
  revalidatePath("/vault/recipients");
  redirect("/vault/recipients");
}

export async function removeRecipient(formData: FormData) {
  const { supabase, user } = await requireUser();
  await supabase.from("recipients").delete().eq("id", String(formData.get("id") ?? "")).eq("owner_id", user.id);
  revalidatePath("/vault/recipients");
  redirect("/vault/recipients");
}

export async function saveReleaseHolder(formData: FormData) {
  const { supabase, user } = await requireUser();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  if (!fullName || !email) redirect("/vault/release-holder?error=1");

  const roleRaw = String(formData.get("role") ?? "solicitor");
  const role = ["solicitor", "will_writer", "executor", "other"].includes(roleRaw) ? roleRaw : "other";

  await supabase.from("release_holders").upsert(
    {
      owner_id: user.id,
      full_name: fullName.slice(0, 120),
      role,
      firm: String(formData.get("firm") ?? "").trim() || null,
      email,
      phone: String(formData.get("phone") ?? "").trim() || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "owner_id" }
  );
  revalidatePath("/vault");
  redirect("/vault?holder=1");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
