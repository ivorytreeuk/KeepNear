import "server-only";

const FROM = process.env.EMAIL_FROM || "KeepNear <no-reply@keepnear.co.uk>";

export function emailEnabled() {
  return Boolean(process.env.RESEND_API_KEY);
}

/** Sends one email through Resend. Returns an error message, or null on success. */
export async function sendEmail(to: string, subject: string, html: string): Promise<string | null> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return "RESEND_API_KEY is not set";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [to], subject, html, reply_to: "info@keepnear.co.uk" }),
    });
    if (!res.ok) return `Resend ${res.status}: ${(await res.text()).slice(0, 200)}`;
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : "Email failed";
  }
}

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** The KeepNear email layout, matching the branded sign-up emails. */
export function layout(heading: string, paragraphs: string[], button?: { href: string; label: string }, footnote?: string) {
  const body = paragraphs
    .map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;">${p}</p>`)
    .join("");
  const btn = button
    ? `<p style="margin:8px 0 28px;"><a href="${esc(button.href)}" style="display:inline-block;background:#5B2A3C;color:#FFF4EA;text-decoration:none;font-weight:700;font-size:16px;padding:14px 28px;border-radius:999px;">${esc(button.label)}</a></p>`
    : "";
  const foot = footnote ? `<p style="margin:0;font-size:14px;line-height:1.6;color:#6B4452;">${footnote}</p>` : "";
  return `<div style="background:#FFF4EA;padding:32px 16px;font-family:Nunito,Helvetica,Arial,sans-serif;color:#3E1B28;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #E8D6C8;border-radius:20px;"><tr><td style="padding:32px 28px;">
<p style="margin:0 0 24px;font-size:26px;font-weight:800;color:#5B2A3C;">keepnear</p>
<h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#5B2A3C;">${esc(heading)}</h1>
${body}${btn}${foot}
</td></tr></table>
<p style="max-width:520px;margin:16px auto 0;font-size:12px;line-height:1.5;color:#6B4452;text-align:center;">KeepNear · Your words, kept near to the people you love<br />A service of Ivory Tree Inc Ltd · info@keepnear.co.uk</p>
</div>`;
}

export { esc };
