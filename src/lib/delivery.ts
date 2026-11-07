import "server-only";
import { randomBytes } from "crypto";
import { createAdminClient } from "./supabase/admin";
import { esc, layout, sendEmail } from "./email";
import { fmtDate } from "./keepsake-types";

const SITE = () => (process.env.NEXT_PUBLIC_SITE_URL || "https://keepnear.co.uk").replace(/\/$/, "");
const KEEP_FOR_DAYS = 365;

/** Today's date in the UK, as YYYY-MM-DD. */
export function ukToday(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(d);
}

function newToken() {
  return randomBytes(24).toString("base64url");
}

/** Creates a delivery row for every recipient of each keepsake (skips any that already exist). */
export async function ensureDeliveries(keepsakeIds: string[], scheduledFor: (k: { release_date: string | null }) => string) {
  if (keepsakeIds.length === 0) return 0;
  const admin = createAdminClient();
  const { data: rows } = await admin
    .from("keepsakes")
    .select("id, release_date, keepsake_recipients(recipient_id)")
    .in("id", keepsakeIds)
    .eq("status", "ready");
  const inserts: { keepsake_id: string; recipient_id: string; token: string; scheduled_for: string }[] = [];
  for (const k of rows ?? []) {
    const links = (k.keepsake_recipients as { recipient_id: string }[] | null) ?? [];
    for (const l of links) {
      inserts.push({ keepsake_id: k.id, recipient_id: l.recipient_id, token: newToken(), scheduled_for: scheduledFor(k) });
    }
  }
  if (inserts.length === 0) return 0;
  const { data } = await admin
    .from("deliveries")
    .upsert(inserts, { onConflict: "keepsake_id,recipient_id", ignoreDuplicates: true })
    .select("id");
  return data?.length ?? 0;
}

type DeliveryRow = {
  id: string;
  token: string;
  keepsake_id: string;
  recipients: { full_name: string; email: string | null } | null;
  keepsakes: { title: string; category: string; owner_id: string; release_date: string | null } | null;
};

/** Emails one recipient their private link. */
async function sendOne(d: DeliveryRow) {
  const admin = createAdminClient();
  const to = d.recipients?.email;
  if (!to || !d.keepsakes) {
    await admin.from("deliveries").update({ status: "failed", error: "No email address for this recipient" }).eq("id", d.id);
    return false;
  }
  const { data: owner } = await admin.from("profiles").select("full_name").eq("id", d.keepsakes.owner_id).single();
  const from = owner?.full_name || "Someone who loves you";
  const first = d.recipients?.full_name?.split(" ")[0] || "there";
  const link = `${SITE()}/receive/${d.token}`;
  const living = d.keepsakes.category === "living";

  const subject = living ? `${from} saved a message for you to open today` : `A message from ${from}, for you`;
  const html = layout(
    living ? `Hi ${first}, this one's for today` : `Hi ${first}`,
    living
      ? [
          `${esc(from)} recorded something for you on KeepNear and asked us to make sure it reached you today.`,
          `It's called <strong>&ldquo;${esc(d.keepsakes.title)}&rdquo;</strong>.`,
        ]
      : [
          `${esc(from)} recorded something for you on KeepNear, and asked us to make sure it reached you.`,
          `We're very sorry for your loss. Take your time; this link will work for the next 12 months, and you can download your own copy.`,
          `It's called <strong>&ldquo;${esc(d.keepsakes.title)}&rdquo;</strong>.`,
        ],
    { href: link, label: "Open your message" },
    "This link is only for you, so please don't forward this email. Questions? Reply to this email or write to info@keepnear.co.uk."
  );

  const err = await sendEmail(to, subject, html);
  const sentAt = new Date();
  await admin
    .from("deliveries")
    .update(
      err
        ? { status: "failed", error: err }
        : {
            status: "sent",
            sent_at: sentAt.toISOString(),
            expires_at: new Date(sentAt.getTime() + KEEP_FOR_DAYS * 86400000).toISOString(),
            error: null,
          }
    )
    .eq("id", d.id);
  return !err;
}

/** Sends every delivery that is due (or the given ones). */
export async function sendDue(onlyIds?: string[]) {
  const admin = createAdminClient();
  let q = admin
    .from("deliveries")
    .select("id, token, keepsake_id, recipients(full_name, email), keepsakes(title, category, owner_id, release_date)")
    .eq("status", "scheduled")
    .lte("scheduled_for", ukToday())
    .limit(100);
  if (onlyIds?.length) q = q.in("id", onlyIds);
  const { data } = await q;
  let sent = 0;
  let failed = 0;
  for (const d of (data ?? []) as unknown as DeliveryRow[]) {
    if (await sendOne(d)) sent++;
    else failed++;
  }
  return { sent, failed };
}

/** Sends a keepsake to its recipients right now (used by the admin "Send now" button). */
export async function sendKeepsakeNow(keepsakeId: string) {
  const today = ukToday();
  await ensureDeliveries([keepsakeId], () => today);
  const admin = createAdminClient();
  // Pull forward anything scheduled later, and retry failed ones.
  await admin
    .from("deliveries")
    .update({ scheduled_for: today, status: "scheduled", error: null })
    .eq("keepsake_id", keepsakeId)
    .in("status", ["scheduled", "failed"]);
  const { data } = await admin.from("deliveries").select("id").eq("keepsake_id", keepsakeId).eq("status", "scheduled");
  return sendDue((data ?? []).map((r) => r.id));
}

/** Releases an owner's "after I'm gone" keepsakes once their release case is approved. */
export async function releaseOwner(ownerId: string) {
  const admin = createAdminClient();
  const today = ukToday();
  const { data: ks } = await admin
    .from("keepsakes")
    .select("id, release_on, release_date")
    .eq("owner_id", ownerId)
    .eq("category", "legacy")
    .eq("status", "ready");
  const now = (ks ?? []).filter((k) => k.release_on !== "date" || !k.release_date || k.release_date <= today);
  const later = (ks ?? []).filter((k) => k.release_on === "date" && k.release_date && k.release_date > today);
  await ensureDeliveries(now.map((k) => k.id), () => today);
  await ensureDeliveries(later.map((k) => k.id), (k) => k.release_date!);
  return sendDue();
}

/** The daily job: time capsules due today, dated legacy messages, and one-week reminders. */
export async function runDaily() {
  const admin = createAdminClient();
  const today = ukToday();

  // 1. Time capsules whose day has come.
  const { data: living } = await admin
    .from("keepsakes")
    .select("id")
    .eq("category", "living")
    .eq("status", "ready")
    .lte("release_date", today);
  const created = await ensureDeliveries((living ?? []).map((k) => k.id), () => today);

  // 2. Send everything due (time capsules, plus dated legacy messages from released accounts).
  const result = await sendDue();

  // 3. One-week reminders to owners of time capsules.
  const inAWeek = ukToday(7);
  const { data: upcoming } = await admin
    .from("keepsakes")
    .select("id, title, owner_id, release_date, reminders_sent(keepsake_id)")
    .eq("category", "living")
    .eq("status", "ready")
    .eq("release_date", inAWeek);
  let reminders = 0;
  for (const k of upcoming ?? []) {
    if ((k.reminders_sent as unknown[] | null)?.length) continue;
    const { data: u } = await admin.auth.admin.getUserById(k.owner_id);
    const email = u?.user?.email;
    if (!email) continue;
    const err = await sendEmail(
      email,
      `"${k.title}" goes out in one week`,
      layout(
        "One week to go",
        [
          `Your time capsule <strong>&ldquo;${esc(k.title)}&rdquo;</strong> will be delivered on ${fmtDate(k.release_date!)}.`,
          "If you'd like to change the date, the people it goes to, or cancel it, you can do that in your vault until the day before.",
        ],
        { href: `${SITE()}/vault/${k.id}`, label: "Check it in my vault" }
      )
    );
    if (!err) {
      await admin.from("reminders_sent").insert({ keepsake_id: k.id });
      reminders++;
    }
  }

  return { today, created, ...result, reminders };
}
