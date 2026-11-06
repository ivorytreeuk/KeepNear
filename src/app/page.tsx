import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import {
  GrandparentScene,
  MilestoneScene,
  NewParentScene,
  PartnersScene,
  RecordingScene,
  SealedEnvelope,
  WeddingScene,
} from "@/components/illustrations";

const CHAPTERS = [
  {
    Scene: NewParentScene,
    title: "New parents",
    body: "Messages for the first day of school, their 18th, the day they become parents themselves. Just in case.",
    prompt: "The night you were born, this is what I was thinking…",
  },
  {
    Scene: GrandparentScene,
    title: "Grandparents",
    body: "The family stories, the recipes nobody wrote down, and the voice they'll want to hear again.",
    prompt: "Let me show you how your great-gran made her jollof…",
  },
  {
    Scene: WeddingScene,
    title: "Their big days",
    body: "Pick a date and your message arrives on it, years from now. A wedding morning. A graduation.",
    prompt: "If you're watching this, you're getting married today…",
  },
  {
    Scene: PartnersScene,
    title: "Partners",
    body: "The things you say every day, and the things you never quite get round to saying.",
    prompt: "I never told you about the moment I knew…",
  },
  {
    Scene: MilestoneScene,
    title: "Growing up",
    body: "Advice for the hard years, saved for the age they'll actually need it.",
    prompt: "At sixteen I thought I knew everything. Here's what I got wrong…",
  },
  {
    Scene: RecordingScene,
    title: "Anyone writing a will",
    body: "Your will says who gets what. KeepNear lets you say why, and what they meant to you.",
    prompt: "I wanted you to have the house, but more than that…",
  },
];

const TIMELINE = [
  { when: "Today", title: "You record it", body: "Two minutes on your phone, in your own voice." },
  { when: "Sealed", title: "It waits, privately", body: "Nobody can watch it. Not family, not us." },
  { when: "2038", title: "Her 18th birthday", body: "It arrives on the morning you chose." },
  { when: "2045", title: "Her wedding day", body: "And another, for the day you'd most want to be there." },
];

const STEPS = [
  { title: "Record in the app", body: "Use your phone, iPad or laptop camera. The video goes straight into your private vault, never into your photos." },
  { title: "Choose who it's for", body: "Pick the people each message belongs to. Add photos, letters and documents too." },
  { title: "Name your release holder", body: "Your solicitor, will writer or executor. They can't watch anything. They just tell us when the time comes." },
  { title: "Delivered when it matters", body: "After we've confirmed a death, each person receives only the keepsakes meant for them." },
];

function PhoneCard({
  children,
  label,
  caption,
  className = "",
}: {
  children: React.ReactNode;
  label: React.ReactNode;
  caption: string;
  className?: string;
}) {
  return (
    <div className={`rounded-[28px] border border-line bg-white p-2.5 shadow-[0_18px_40px_-18px_rgba(62,27,40,0.35)] ${className}`}>
      <div className="relative overflow-hidden rounded-[22px] bg-cream">
        {children}
        <div className="absolute left-3 top-3">{label}</div>
      </div>
      <p className="px-2 pb-1 pt-2.5 text-sm font-bold leading-snug text-plum">{caption}</p>
    </div>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  return (
    <>
      <SiteHeader />
      <main className="overflow-x-hidden">
        {sp.closed && (
          <p role="status" className="mx-auto mt-4 max-w-5xl rounded-xl bg-white p-3 px-4 text-sm">
            Your account has been closed and everything in it deleted. Thank you for trying KeepNear.
          </p>
        )}

        {/* ── Hero ── */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-10 md:grid-cols-[1.05fr_1fr] md:pt-16">
          <div>
            <p className="kn-rise inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-plum">
              <span className="h-2 w-2 rounded-full bg-peach" aria-hidden="true" /> Video messages for the people you love
            </p>
            <h1 className="kn-rise-2 mt-5 text-4xl font-extrabold leading-[1.08] text-plum md:text-6xl">
              Say it in your own words. Kept safe until they need it.
            </h1>
            <p className="kn-rise-3 mt-5 max-w-xl text-lg">
              Record a message today for a birthday, a wedding morning, or simply for when you&apos;re not there.
              KeepNear keeps it sealed, then delivers it to the right person at the right moment.
            </p>
            <div className="kn-rise-3 mt-7 flex flex-wrap gap-3">
              <Link href="/signup" className="btn">Record your first message free</Link>
              <Link href="#how" className="btn-outline">See how it works</Link>
            </div>
            <p className="kn-rise-3 mt-4 text-sm text-muted">Free to start · Stored in the UK · Cancel any time</p>
          </div>

          <div className="relative mx-auto h-[480px] w-full max-w-[460px]" aria-hidden="true">
            <PhoneCard
              className="kn-float-slow absolute left-0 top-0 w-[42%] [--r:-5deg]"
              caption="Delivered · June 2045"
              label={<span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-extrabold text-plum">Wedding day</span>}
            >
              <WeddingScene className="block w-full" />
            </PhoneCard>

            <PhoneCard
              className="kn-float-slow absolute bottom-0 left-[5%] w-[40%] [--r:4deg]"
              caption="For the grandchildren"
              label={<span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-extrabold text-plum">Recipe</span>}
            >
              <GrandparentScene className="block w-full" />
            </PhoneCard>

            <PhoneCard
              className="kn-float absolute right-0 top-[16%] z-10 w-[54%]"
              caption="For Mia, to open on her 18th birthday"
              label={
                <span className="inline-flex items-center gap-1.5 rounded-full bg-plum px-2.5 py-1 text-[11px] font-extrabold text-cream">
                  <span className="kn-pulse h-2 w-2 rounded-full bg-[#E0533D]" /> REC 1:24
                </span>
              }
            >
              <RecordingScene className="block w-full" />
            </PhoneCard>

            <SealedEnvelope className="kn-float absolute right-2 top-0 w-16 [--r:10deg]" />
          </div>
        </section>

        {/* ── Chapters ── */}
        <section className="bg-white py-20" aria-labelledby="chapters">
          <div className="mx-auto max-w-6xl px-4">
            <h2 id="chapters" className="max-w-2xl text-3xl font-extrabold text-plum md:text-4xl">
              Made for every chapter of their story
            </h2>
            <p className="mt-3 max-w-2xl text-lg text-muted">
              Not sure what to say? Most people start with one small, true thing. Here are a few places to begin.
            </p>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {CHAPTERS.map(({ Scene, title, body, prompt }) => (
                <li key={title} className="flex flex-col overflow-hidden rounded-3xl border border-line bg-cream">
                  <Scene className="mx-auto block w-48 pt-4" />
                  <div className="flex flex-1 flex-col bg-white p-5">
                    <h3 className="text-lg font-extrabold text-plum">{title}</h3>
                    <p className="mt-1 flex-1 text-muted">{body}</p>
                    <p className="mt-4 rounded-2xl bg-cream px-4 py-3 text-sm italic">
                      <span className="not-italic font-bold text-plum">Try starting with: </span>&ldquo;{prompt}&rdquo;
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Timeline ── */}
        <section className="mx-auto max-w-6xl px-4 py-20" aria-labelledby="timeline">
          <h2 id="timeline" className="max-w-2xl text-3xl font-extrabold text-plum md:text-4xl">One message. Many years.</h2>
          <p className="mt-3 max-w-2xl text-lg text-muted">
            Record once, and choose exactly when each person receives it, even decades from now.
          </p>
          <ol className="relative mt-12 grid gap-8 md:grid-cols-4 md:gap-6">
            <span className="absolute left-5 top-5 hidden h-[3px] w-[calc(100%-2.5rem)] rounded-full bg-line md:block" aria-hidden="true" />
            <span className="absolute bottom-0 left-5 top-5 w-[3px] rounded-full bg-line md:hidden" aria-hidden="true" />
            {TIMELINE.map((t, i) => (
              <li key={t.when} className="relative flex gap-4 md:flex-col">
                <span
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${
                    i === 1 ? "bg-plum text-cream" : "bg-peach text-plum-dark"
                  }`}
                >
                  {i + 1}
                </span>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-muted">{t.when}</p>
                  <h3 className="mt-1 text-lg font-extrabold text-plum">{t.title}</h3>
                  <p className="mt-1 text-muted">{t.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── How it works ── */}
        <section id="how" className="scroll-mt-6 bg-white py-20" aria-labelledby="how-h">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-[1fr_1.2fr]">
            <div className="mx-auto w-full max-w-sm">
              <div className="rounded-[40px] bg-cream p-6">
                <RecordingScene className="block w-full" />
              </div>
            </div>
            <div>
              <h2 id="how-h" className="text-3xl font-extrabold text-plum md:text-4xl">How it works</h2>
              <ol className="mt-8 flex flex-col gap-6">
                {STEPS.map((s, i) => (
                  <li key={s.title} className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-peach font-extrabold text-plum-dark">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold">{s.title}</h3>
                      <p className="mt-1 text-muted">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ── Trust ── */}
        <section className="mx-auto max-w-6xl px-4 py-20" aria-labelledby="trust">
          <div className="grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 id="trust" className="text-3xl font-extrabold text-plum md:text-4xl">Private by design</h2>
              <p className="mt-3 max-w-xl text-lg text-muted">
                What you say in here is for them, and nobody else. We built KeepNear so it stays that way.
              </p>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  ["Stored in the UK", "Encrypted and kept on London servers."],
                  ["Nobody watches early", "Not your family, not your solicitor, not us."],
                  ["Never lost if you stop paying", "Your vault is frozen, not deleted, and still released."],
                  ["You stay in control", "Change who it's for, or delete anything, any time."],
                ].map(([h, b]) => (
                  <li key={h} className="card">
                    <h3 className="font-bold">{h}</h3>
                    <p className="mt-1 text-muted">{b}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mx-auto w-56 md:w-72">
              <SealedEnvelope className="kn-float block w-full [--r:-4deg]" />
              <p className="mt-4 text-center text-sm font-bold text-plum">Sealed until the day you choose</p>
            </div>
          </div>
        </section>

        {/* ── Price teaser ── */}
        <section className="mx-auto max-w-6xl px-4" aria-labelledby="price">
          <div className="flex flex-wrap items-center gap-5 rounded-3xl bg-white p-6 md:p-8">
            <div className="flex-1">
              <h2 id="price" className="text-2xl font-extrabold text-plum">Start with one message, free</h2>
              <p className="mt-1 text-muted">Plans from £2.99 a month when you want to say more.</p>
            </div>
            <Link href="/signup" className="btn">Start free</Link>
            <Link href="/pricing" className="btn-outline">See plans</Link>
          </div>
        </section>

        {/* ── Partners ── */}
        <section className="mx-auto mt-10 max-w-6xl px-4" aria-labelledby="partners">
          <div className="grid items-center gap-8 rounded-3xl bg-plum p-8 text-cream md:grid-cols-[1.4fr_1fr] md:p-12">
            <div>
              <h2 id="partners" className="text-2xl font-extrabold md:text-3xl">Solicitors, will writers and funeral directors</h2>
              <p className="mt-3 max-w-2xl opacity-90">
                Offer KeepNear to your clients alongside their will. A will says who gets what. A KeepNear message says
                why. We&apos;re looking for founding partners in England and Wales.
              </p>
              <Link
                href="/contact?topic=partner"
                className="mt-6 inline-flex min-h-11 items-center rounded-full bg-cream px-5 font-bold text-plum"
              >
                Talk to us about partnering
              </Link>
            </div>
            <div className="mx-auto w-48 rounded-[32px] bg-cream/10 p-4 md:w-56">
              <PartnersScene className="block w-full" />
            </div>
          </div>
        </section>

        {/* ── Closing ── */}
        <section className="mx-auto max-w-3xl px-4 py-20 text-center" aria-labelledby="closing">
          <NewParentScene className="mx-auto block w-40" />
          <h2 id="closing" className="mt-4 text-3xl font-extrabold text-plum md:text-4xl">
            There&apos;s something you&apos;d want them to hear.
          </h2>
          <p className="mt-3 text-lg text-muted">Two minutes is enough to start.</p>
          <Link href="/signup" className="btn mt-6">Record your first message free</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
