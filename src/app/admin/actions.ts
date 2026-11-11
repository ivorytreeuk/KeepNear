"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  checkPasscode,
  clearAdminSession,
  getAdminUser,
  requireUnlockedAdmin,
  setAdminSession,
} from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { releaseOwner, runDaily, sendKeepsakeNow } from "@/lib/delivery";
import { esc, layout, sendEmail } from "@/lib/email";

const HOLD_DAYS = 14;

export async function unlockAdmin(_prev: { error?: string } | null, formData: FormData): Promise<{ error?: string }> {
  const user = await getAdminUser();
  if (!user) redirect("/");
  // Small delay makes guessing the passcode slow.
  await new Promise((r) => setTimeout(r, 600));
  if (!checkPasscode(String(formData.get("passcode") ?? ""))) {
    return { error: "That passcode isn't right. It must match ADMIN_PASSCODE in Vercel exactly (capital letters count)." };
  }
  await setAdminSession(user.id);
  redirect("/admin");
}

export async function signOutToStaff() {
  const { createClient } = await import("@/lib/supabase/server");
  await (await createClient()).auth.signOut();
  redirect("/login/admin");
}

export async function lockAdmin() {
  await clearAdminSession();
  redirect("/vault");
}

export async function sendNow(formData: FormData) {
  await requireUnlockedAdmin();
  const id = String(formData.get("keepsake_id") ?? "");
  const r = await sendKeepsakeNow(id);
  revalidatePath("/admin");
  redirect(`/admin?sent=${r.sent}&failed=${r.failed}`);
}

export async function runDailyNow() {
  await requireUnlockedAdmin();
  const r = await runDaily();
  revalidatePath("/admin");
  redirect(`/admin?sent=${r.sent}&failed=${r.failed}&reminders=${r.reminders}`);
}

export async function startRelease(formData: FormData) {
  await requireUnlockedAdmin();
  const ownerId = String(formData.get("owner_id") ?? "");
  const reportedBy = String(formData.get("reported_by") ?? "").trim().slice(0, 200);
  const evidence = String(formData.get("evidence") ?? "").trim().slice(0, 2000);
  if (!ownerId || !reportedBy || !evidence) redirect(`/admin/people?q=${ownerId}&error=details`);

  const admin = createAdminClient();
  const holdUntil = new Date(Date.now() + HOLD_DAYS * 86400000).toISOString();
  await admin.from("release_cases").upsert({
    owner_id: ownerId,
    status: "hold",
    reported_by: reportedBy,
    evidence,
    started_at: new Date().toISOString(),
    hold_until: holdUntil,
    released_at: null,
    updated_at: new Date().toISOString(),
  });

  // Tell the account owner, in case this is a mistake.
  const { data: u } = await admin.auth.admin.getUserById(ownerId);
  if (u?.user?.email) {
    await sendEmail(
      u.user.email,
      "Important: a release has been requested for your KeepNear vault",
      layout(
        "Is everything all right?",
        [
          `We've been told that you have passed away, and a request has been made to release your KeepNear keepsakes to the people you chose.`,
          `<strong>If you're reading this, please reply to this email or contact info@keepnear.co.uk straight away</strong> and we'll stop the release. Nothing will be shared for ${HOLD_DAYS} days.`,
          `Request made by: ${esc(reportedBy)}.`,
        ],
        undefined,
        "We're sorry if this message reaches you at a difficult time for your family."
      )
    );
  }
  revalidatePath("/admin");
  redirect(`/admin/people?q=${ownerId}&started=1`);
}

export async function cancelRelease(formData: FormData) {
  await requireUnlockedAdmin();
  const ownerId = String(formData.get("owner_id") ?? "");
  await createAdminClient()
    .from("release_cases")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("owner_id", ownerId);
  revalidatePath("/admin");
  redirect(`/admin/people?q=${ownerId}&cancelled=1`);
}

export async function releaseNow(formData: FormData) {
  await requireUnlockedAdmin();
  const ownerId = String(formData.get("owner_id") ?? "");
  const override = formData.get("override") === "on";
  const admin = createAdminClient();
  const { data: rc } = await admin.from("release_cases").select("*").eq("owner_id", ownerId).single();
  if (!rc || rc.status === "cancelled") redirect(`/admin/people?q=${ownerId}&error=nocase`);
  if (rc.status === "hold" && new Date(rc.hold_until) > new Date() && !override) {
    redirect(`/admin/people?q=${ownerId}&error=hold`);
  }
  await admin
    .from("release_cases")
    .update({ status: "released", released_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("owner_id", ownerId);
  const r = await releaseOwner(ownerId);
  revalidatePath("/admin");
  redirect(`/admin/people?q=${ownerId}&released=1&sent=${r.sent}&failed=${r.failed}`);
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function partnerFields(formData: FormData) {
  const rate = Math.min(100, Math.max(0, Number(formData.get("commission_rate") ?? 20) || 0));
  const website = String(formData.get("website") ?? "").trim();
  return {
    name: String(formData.get("name") ?? "").trim().slice(0, 120),
    type: String(formData.get("type") ?? "other"),
    website: website ? (website.startsWith("http") ? website : `https://${website}`) : null,
    description: String(formData.get("description") ?? "").trim().slice(0, 600) || null,
    region: String(formData.get("region") ?? "").trim().slice(0, 120) || null,
    contact_email: String(formData.get("contact_email") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    commission_rate: rate,
    promo_code: String(formData.get("promo_code") ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 30) || null,
    active: formData.get("active") === "on",
  };
}

async function setMembers(partnerId: string, raw: string) {
  const admin = createAdminClient();
  const emails = Array.from(
    new Set(
      raw
        .split(/[\s,;]+/)
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.includes("@"))
    )
  );
  await admin.from("partner_members").delete().eq("partner_id", partnerId);
  if (emails.length) await admin.from("partner_members").insert(emails.map((email) => ({ partner_id: partnerId, email })));
}

export async function createPartner(formData: FormData) {
  await requireUnlockedAdmin();
  const fields = partnerFields(formData);
  if (!fields.name) redirect("/admin/partners?error=name");
  const admin = createAdminClient();
  let slug = slugify(String(formData.get("slug") || fields.name));
  const { data: clash } = await admin.from("partners").select("id").eq("slug", slug).maybeSingle();
  if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  const { newReference } = await import("@/lib/partner-ref");
  const reference = await newReference();
  const { data, error } = await admin.from("partners").insert({ ...fields, slug, reference }).select("id").single();
  if (error || !data) redirect("/admin/partners?error=save");
  await setMembers(data.id, String(formData.get("members") ?? ""));
  revalidatePath("/admin/partners");
  redirect("/admin/partners?created=1");
}

export async function updatePartner(formData: FormData) {
  await requireUnlockedAdmin();
  const id = String(formData.get("id") ?? "");
  const fields = partnerFields(formData);
  if (!id || !fields.name) redirect("/admin/partners?error=name");
  await createAdminClient().from("partners").update(fields).eq("id", id);
  await setMembers(id, String(formData.get("members") ?? ""));
  revalidatePath("/admin/partners");
  redirect("/admin/partners?saved=1");
}
