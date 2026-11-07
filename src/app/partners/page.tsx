import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { PartnersScene } from "@/components/illustrations";
import { PARTNER_TYPES } from "@/lib/admin-data";
import { applyToPartner } from "./actions";

export const metadata = {
  title: "Partner with KeepNear",
  description:
    "For solicitors, will writers, funeral directors, insurers and hospices: offer your clients KeepNear and earn a share of every subscription.",
};

const WHO = [
  ["Solicitors and will writers", "Add a KeepNear vault to every will or lasting power of attorney. You act as release holder, which keeps your firm at the centre of the family's story."],
  ["Funeral directors", "Offer KeepNear in pre-paid funeral plans, and point families to a gentle place to keep the messages that matter."],
  ["Life insurers and advisers", "A meaningful extra for policyholders that gives them a reason to stay, and you a warm reason to get in touch."],
  ["Hospices and charities", "Help patients leave their voice for the people they love. We'll talk about free places for those who need them."],
];

const STEPS = [
  ["Tell us about your firm", "Fill in the short form below. We'll reply within two working days and arrange a 20-minute call."],
  ["Get your link and listing", "You get a free listing in our directory, a personal referral link and a partner dashboard."],
  ["Introduce your clients", "Share your link in client emails, will packs or on your website. We'll send you leaflets if you'd like them."],
  ["Earn and track it", "See every click, sign-up and payment in your dashboard. We pay your share every quarter."],
];

const FAQ = [
  ["Do we have to pay anything?", "No. Partnering is free, and so is your directory listing."],
  ["How is the revenue share worked out?", "Founding partners receive 20% of every payment from clients they refer, for 24 months from the client's sign-up. It's paid quarterly once your balance reaches £50."],
  ["We're a regulated firm. Can we accept referral payments?", "Many firms can, as long as clients are told about it. If you'd rather not receive payments, we can pass the value on as a discount for your clients instead. We'll agree the right option with you on our call."],
  ["Can our clients' families see anything early?", "No. Only the account owner can view their vault. When they die, the release holder tells us, and after a 14-day hold each person receives only what was meant for them. Release holders never see the content."],
  ["Where is the data kept?", "On encrypted servers in London, in a private store that only the account owner can open."],
];

export default async function PartnersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-12 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="font-bold uppercase tracking-wider text-muted">For professionals</p>
            <h1 className="mt-2 text-4xl font-extrabold text-plum md:text-5xl">Partner with KeepNear</h1>
            <p className="mt-4 text-lg">
              Your clients already trust you with their wishes. KeepNear lets them leave something more personal: video
              messages, letters and photos, released to the people they love at the right moment. You help them set it
              up, and you earn a share of every subscription.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#interest" className="btn">Express interest</a>
              <Link href="/directory" className="rounded-full border border-line bg-white px-5 py-3 font-bold text-plum">See the directory</Link>
            </div>
          </div>
          <PartnersScene className="w-full" />
        </section>

        <section className="bg-white py-12" aria-labelledby="who">
          <div className="mx-auto max-w-5xl px-4">
            <h2 id="who" className="text-3xl font-extrabold text-plum">Who can partner</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {WHO.map(([t, d]) => (
                <div key={t} className="rounded-2xl border border-line bg-cream p-5">
                  <h3 className="text-lg font-extrabold text-plum">{t}</h3>
                  <p className="mt-1">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12" aria-labelledby="how">
          <h2 id="how" className="text-3xl font-extrabold text-plum">How it works</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-4">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="card">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-peach font-extrabold text-plum-dark">{i + 1}</span>
                <h3 className="mt-3 font-extrabold text-plum">{t}</h3>
                <p className="mt-1 text-sm">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="bg-plum py-12 text-cream" aria-labelledby="get">
          <div className="mx-auto max-w-5xl px-4">
            <h2 id="get" className="text-3xl font-extrabold">What you get</h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                ["20% revenue share", "On every payment from clients you refer, for 24 months. Founding partner rate."],
                ["Free directory listing", "People without a solicitor or funeral director are shown our recommended partners, with a link to your website."],
                ["Your own dashboard", "Live figures: directory views, clicks to your site, sign-ups and what you've earned."],
                ["Client offers", "A discount code for your clients, or the value passed on to them instead of a fee."],
                ["Co-branded material", "Leaflets and email wording with your logo, ready to put in will packs."],
                ["A named contact", "One person at KeepNear to call, and help for families when the time comes."],
              ].map(([t, d]) => (
                <li key={t} className="rounded-2xl bg-cream/10 p-5">
                  <h3 className="text-lg font-extrabold text-peach">{t}</h3>
                  <p className="mt-1">{d}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-12" aria-labelledby="faq">
          <h2 id="faq" className="text-3xl font-extrabold text-plum">Questions partners ask</h2>
          <div className="mt-4 flex flex-col gap-3">
            {FAQ.map(([q, a]) => (
              <details key={q} className="card">
                <summary className="cursor-pointer text-lg font-bold">{q}</summary>
                <p className="mt-2 text-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="interest" className="mx-auto max-w-3xl scroll-mt-6 px-4 pb-6" aria-labelledby="int">
          <div className="card">
            <h2 id="int" className="text-3xl font-extrabold text-plum">Express interest</h2>
            {sp.sent ? (
              <p role="status" className="mt-4 rounded-xl bg-cream p-4 text-lg">
                Thank you. We&apos;ve got your details and will be in touch within two working days.
              </p>
            ) : (
              <>
                <p className="mt-2 text-muted">
                  No commitment. Or email us at{" "}
                  <a href="mailto:info@keepnear.co.uk" className="font-bold text-plum underline">info@keepnear.co.uk</a>.
                </p>
                {sp.error && (
                  <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">
                    Please fill in your organisation, your name and a valid email.
                  </p>
                )}
                <form action={applyToPartner} className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1 font-bold">
                    Organisation
                    <input name="organisation" required maxLength={160} className="field font-normal" />
                  </label>
                  <label className="flex flex-col gap-1 font-bold">
                    Type of organisation
                    <select name="type" defaultValue="solicitor" className="field font-normal">
                      {Object.entries(PARTNER_TYPES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 font-bold">
                    Your name
                    <input name="contact_name" required maxLength={120} autoComplete="name" className="field font-normal" />
                  </label>
                  <label className="flex flex-col gap-1 font-bold">
                    Email
                    <input name="email" type="email" required autoComplete="email" className="field font-normal" />
                  </label>
                  <label className="flex flex-col gap-1 font-bold">
                    Phone (optional)
                    <input name="phone" type="tel" autoComplete="tel" className="field font-normal" />
                  </label>
                  <label className="flex flex-col gap-1 font-bold">
                    Website (optional)
                    <input name="website" className="field font-normal" placeholder="https://" />
                  </label>
                  <label className="flex flex-col gap-1 font-bold sm:col-span-2">
                    Area you cover (optional)
                    <input name="region" className="field font-normal" placeholder="e.g. Derbyshire and Staffordshire" />
                  </label>
                  <label className="flex flex-col gap-1 font-bold sm:col-span-2">
                    Anything you&apos;d like to tell us (optional)
                    <textarea name="message" rows={4} maxLength={3000} className="field font-normal" />
                  </label>
                  <div aria-hidden="true" className="hidden">
                    <label>Leave this empty <input name="company_site" tabIndex={-1} autoComplete="off" /></label>
                  </div>
                  <button type="submit" className="btn self-start">Express interest</button>
                </form>
              </>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
