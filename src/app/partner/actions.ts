"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PARTNER_TYPES } from "@/lib/admin-data";
import { emailEnabled, esc, layout, sendEmail } from "@/lib/email";
import { looksLikeReference, newReference, normaliseReference } from "@/lib/partner-ref";

type SignUpResult = { error?: string; reference?: string; email?: string; session?: boolean; existing?: boolean };

function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "partner";
}

export async function partnerSignUp(input: Record<string, string>): Promise<SignUpResult> {
  try {
    const get = (k: string, max: number) => String(input[k] ?? "").trim().slice(0, max);
    const organisation = get("organisation", 120);
    const contactName = get("contact_name", 120);
    const email = get("email", 200).toLowerCase();
    const type = PARTNER_TYPES[get("type", 40)] ? get("type", 40) : "other";
    const password = String(input.password ?? "");
    if (organisation.length < 2) return { error: "Please enter your organisation's name." };
    if (contactName.length < 2) return { error: "Please enter the name of the main contact." };
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Please enter a valid company email." };
    if (password.length < 8) return { error: "The password needs at least 8 characters." };
    if (password !== String(input.confirm ?? "")) return { error: "The two passwords don't match." };
    if (input.agree !== "on") return { error: "Please agree to the Terms of Use to continue." };

    const h = await headers();
    const origin = (process.env.NEXT_PUBLIC_SITE_URL || h.get("origin") || "").replace(/\/$/, "");
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: contactName, account_type: "partner", organisation, terms_accepted_at: new Date().toISOString(), terms_version: "2026-11-05" },
        emailRedirectTo: `${origin}/auth/callback?next=/partner`,
      },
    });
    if (error) return { error: error.message };
    if (data.user && (data.user.identities ?? []).length === 0) return { existing: true };

    const admin = createAdminClient();
    const website = get("website", 200);

    // If we already added this firm by hand, link to it rather than creating a duplicate.
    const { data: member } = await admin.from("partner_members").select("partner_id").eq("email", email).maybeSingle();
    let reference: string;
    if (member) {
      const { data: existing } = await admin.from("partners").select("id, reference").eq("id", member.partner_id).single();
      reference = existing?.reference ?? (await newReference());
      if (!existing?.reference) await admin.from("partners").update({ reference }).eq("id", member.partner_id);
    } else {
      reference = await newReference();
      let slug = slugify(organisation);
      const { data: clash } = await admin.from("partners").select("id").eq("slug", slug).maybeSingle();
      if (clash) slug = `${slug}-${reference.slice(4).toLowerCase()}`;
      const { data: p, error: insErr } = await admin
        .from("partners")
        .insert({
          slug,
          name: organisation,
          type,
          reference,
          contact_name: contactName,
          contact_email: email,
          phone: get("phone", 40) || null,
          website: website ? (website.startsWith("http") ? website : `https://${website}`) : null,
          region: get("region", 120) || null,
          active: false, // goes into the directory once KeepNear has checked the firm
          source: "signup",
        })
        .select("id")
        .single();
      if (insErr || !p) return { error: "We couldn't set up your partner account. Please email info@keepnear.co.uk." };
      await admin.from("partner_members").insert({ partner_id: p.id, email });
    }

    if (emailEnabled()) {
      await sendEmail(
        email,
        `Important: your KeepNear partner reference is ${reference}`,
        layout(
          "Your partner reference",
          [
            `Hello ${esc(contactName.split(" ")[0])},`,
            `Thank you for registering <strong>${esc(organisation)}</strong> as a KeepNear partner. Your unique partner reference is:`,
            `<span style="display:inline-block;background:#FFF4EA;border:2px solid #F2A98B;border-radius:12px;padding:12px 20px;font-size:26px;font-weight:800;letter-spacing:3px;color:#5B2A3C;">${reference}</span>`,
            "Keep this email safe. You can sign in with this reference or with this email address, and please quote it whenever you contact us.",
            "Before you can sign in, confirm your email using the separate confirmation email we've just sent. We'll check your details and add you to our directory, usually within two working days.",
          ],
          { href: `${origin}/partner/login`, label: "Go to partner sign-in" },
          "If you didn't register with KeepNear, reply to this email and we'll remove your details."
        ),
        { important: true }
      );
      await sendEmail(
        "info@keepnear.co.uk",
        `New partner sign-up: ${organisation} (${reference})`,
        layout("New partner sign-up", [
          `<strong>${esc(organisation)}</strong> · ${esc(PARTNER_TYPES[type])} · ${reference}`,
          `${esc(contactName)} · ${esc(email)}`,
          "They're hidden from the directory until you tick 'Show in the public directory' in Admin → Partners.",
        ])
      );
    }

    return { reference, email, session: Boolean(data.session) };
  } catch {
    return { error: "Something went wrong on our side. Please try again, or email info@keepnear.co.uk." };
  }
}

/** Partners sign in with their company email or their partner reference. */
export async function partnerSignIn(identifier: string, password: string): Promise<{ error?: string; unconfirmed?: boolean }> {
  try {
    let email = identifier.trim().toLowerCase();
    if (!email.includes("@")) {
      if (!looksLikeReference(email)) return { error: "Enter your company email or your partner reference (it looks like KNP-7H3K9Q)." };
      const admin = createAdminClient();
      const { data: p } = await admin.from("partners").select("id, contact_email").eq("reference", normaliseReference(email)).maybeSingle();
      if (!p) return { error: "That reference and password don't match. Please try again." };
      const { data: members } = await admin.from("partner_members").select("email").eq("partner_id", p.id);
      const list = (members ?? []).map((m) => m.email);
      email = (p.contact_email && list.includes(p.contact_email.toLowerCase()) ? p.contact_email.toLowerCase() : list[0]) ?? "";
      if (!email) return { error: "That reference and password don't match. Please try again." };
    }
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const code = (error as { code?: string }).code;
      if (code === "email_not_confirmed" || /not confirmed/i.test(error.message)) {
        return { unconfirmed: true, error: "Please confirm your email first, using the link in the confirmation email we sent." };
      }
      return { error: "Those details don't match. Please try again." };
    }
    return {};
  } catch {
    return { error: "Something went wrong on our side. Please try again." };
  }
}
