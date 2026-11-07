"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { PARTNER_TYPES } from "@/lib/admin-data";
import { emailEnabled, esc, layout, sendEmail } from "@/lib/email";

export async function applyToPartner(formData: FormData) {
  const get = (k: string, max: number) => String(formData.get(k) ?? "").trim().slice(0, max);
  if (get("company_site", 200)) redirect("/partners?sent=1#interest"); // spam trap
  const organisation = get("organisation", 160);
  const contactName = get("contact_name", 120);
  const email = get("email", 200);
  const typeRaw = get("type", 40);
  const type = PARTNER_TYPES[typeRaw] ? typeRaw : "other";
  if (organisation.length < 2 || contactName.length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    redirect("/partners?error=1#interest");
  }
  const row = {
    organisation,
    type,
    contact_name: contactName,
    email,
    phone: get("phone", 40) || null,
    website: get("website", 200) || null,
    region: get("region", 120) || null,
    message: get("message", 3000) || null,
  };
  const { error } = await createAdminClient().from("partner_applications").insert(row);
  if (error) redirect("/partners?error=1#interest");

  if (emailEnabled()) {
    await sendEmail(
      "info@keepnear.co.uk",
      `New partner enquiry: ${organisation}`,
      layout("New partner enquiry", [
        `<strong>${esc(organisation)}</strong> (${esc(PARTNER_TYPES[type])})`,
        `${esc(contactName)} · ${esc(email)}${row.phone ? ` · ${esc(row.phone)}` : ""}`,
        row.region ? `Area: ${esc(row.region)}` : "",
        row.website ? `Website: ${esc(row.website)}` : "",
        row.message ? esc(row.message) : "",
      ].filter(Boolean))
    ).catch(() => null);
  }
  redirect("/partners?sent=1#interest");
}
