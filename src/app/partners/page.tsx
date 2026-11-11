import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { PartnersScene } from "@/components/illustrations";
import { PARTNER_TYPES } from "@/lib/admin-data";
import { applyToPartner } from "./actions";

export const metadata = {
  title: "Partner with KeepNear",
  description:
    "For solicitors, funeral directors, hospices, insurers, advisers and will writers: offer your clients KeepNear, and help local families through the KeepNear Gift or earn commission.",
};

const WHO = [
  ["Solicitors and will writers", "Add a KeepNear vault to every will or lasting power of attorney. You act as release holder, which keeps your firm at the centre of the family's story."],
  ["Funeral directors", "Offer KeepNear in pre-paid funeral plans, and point families to a gentle place to keep the messages that matter."],
  ["Life insurers and advisers", "A meaningful extra for policyholders that gives them a reason to stay, and you a warm reason to get in touch."],
  ["Hospices and charities", "Help patients leave their voice for the people they love. We'll talk about free places for those who need them."],
];

const STEPS = [
  ["Register your firm", "It takes two minutes. You get a unique partner reference by email straight away."],
  ["Get your link and listing", "You get a free listing in our directory, a personal referral link and a partner dashboard."],
  ["Introduce your clients", "Share your link in client emails, will packs or on your website. We'll send you leaflets if you'd like them."],
  ["Track it all", "See every click, sign-up and payment in your dashboard, and nominate families for the Gift."],
];

const FAQ = [
  ["Do we have to pay anything?", "No. Partnering is free, and so is your directory listing."],
  ["Which option is right for us?", "Solicitors, funeral directors, hospices and charities join the KeepNear Gift. Insurers, financial advisers and will-writing companies earn commission. If you'd prefer the other option, tell us."],
  ["How does the KeepNear Gift work?", "20% of what your referred clients pay in their first year, then 10% for as long as they stay, goes into the fund. Every £250 your clients add unlocks a £250 Gift you can award. You nominate a family from your dashboard, they don't need to be KeepNear customers, and we pay the supplier directly within 5 working days of approval."],
  ["How is commission worked out?", "20% of every payment from clients you refer, for 24 months from the client's sign-up. If a client upgrades, you get 20% of the higher amount. If we refund a payment, the 20% on it is taken back. Paid quarterly once your balance reaches £50."],
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
              up. Depending on your work, your share goes to families in your community through the KeepNear Gift, or
              to you as commission.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/partner/signup" className="btn">Register as a partner</Link>
              <a href="#interest" className="rounded-full border border-line bg-white px-5 py-3 font-bold text-plum">Talk to us first</a>
              <Link href="/partner/login" className="rounded-full px-5 py-3 font-bold text-plum underline">Partner sign-in</Link>
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
            <h2 id="get" className="text-3xl font-extrabold">Two ways to partner</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-cream p-6 text-plum-dark">
                <p className="text-sm font-extrabold uppercase tracking-wider text-muted">Solicitors · funeral directors · hospices · charities</p>
                <h3 className="mt-1 text-2xl font-extrabold text-plum">The KeepNear Gift</h3>
                <p className="mt-2">
                  <strong>20% of what your clients pay in their first year, then 10% for as long as they stay</strong>, goes into a
                  fund for struggling families. You nominate them; we pay for flowers, a wake or a headstone. Nothing is paid
                  to your firm, so there&apos;s no referral fee to disclose.
                </p>
                <p className="mt-3 text-sm">Every 100 clients fund about <strong>£1,185 in year one and £790 a year after that</strong>.</p>
                <Link href="/gift" className="mt-4 inline-block font-bold text-plum underline">See the Gift pot and every Gift paid</Link>
              </div>
              <div className="rounded-2xl bg-cream/10 p-6">
                <p className="text-sm font-extrabold uppercase tracking-wider text-peach">Insurers · financial advisers · will writers</p>
                <h3 className="mt-1 text-2xl font-extrabold">Commission</h3>
                <p className="mt-2">
                  <strong>20% of every payment from clients you refer, for 24 months</strong>, paid quarterly once your balance
                  reaches £50.
                </p>
                <p className="mt-3 text-sm">Every 100 clients earn you about <strong>£2,765 over two years</strong>, or £3,355 if they pay monthly.</p>
              </div>
            </div>
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                ["Your own client code", "Your clients get 25% off the Family plan for their first year with a code in your firm's name."],
                ["Free directory listing", "People without a solicitor or funeral director are shown our recommended partners, with a link to your website."],
                ["Your own dashboard", "Live views, clicks, sign-ups and your share. See an example at keepnear.co.uk/partner/demo."],
              ].map(([t, d]) => (
                <li key={t} className="rounded-2xl bg-cream/10 p-5">
                  <h3 className="text-lg font-extrabold text-peach">{t}</h3>
                  <p className="mt-1">{d}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-cream/80">Figures assume clients stay on the Family plan, paid yearly, using your code.</p>
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
            <h2 id="int" className="text-3xl font-extrabold text-plum">Rather talk first?</h2>
            {sp.sent ? (
              <p role="status" className="mt-4 rounded-xl bg-cream p-4 text-lg">
                Thank you. We&apos;ve got your details and will be in touch within two working days.
              </p>
            ) : (
              <>
                <p className="mt-2 text-muted">
                  Leave your details and we&apos;ll call you. Ready now?{" "}
                  <Link href="/partner/signup" className="font-bold text-plum underline">Register as a partner</Link>. Or email{" "}
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
                  <button type="submit" className="btn self-start">Ask us to call</button>
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
