import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { LogoMark } from "@/components/Logo";

const STEPS = [
  { title: "Record in the app", body: "Use your phone, iPad or laptop camera. The video goes straight into your private vault, never into your photos." },
  { title: "Choose who it's for", body: "Pick the people each message belongs to. Add photos, letters and documents too." },
  { title: "Name your release holder", body: "Your solicitor, will writer or executor. They can't watch anything. They just tell us when the time comes." },
  { title: "Delivered when it matters", body: "After we've confirmed a death, each person receives only the keepsakes meant for them." },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight text-plum md:text-5xl">
              Say it in your own words. Kept safe until they need it.
            </h1>
            <p className="mt-4 text-lg">
              Record messages for the people you love: for a birthday, a wedding day, or simply for when you&apos;re
              not there. KeepNear keeps them private until the moment they&apos;re meant for.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/signup" className="btn">Record your first message free</Link>
              <Link href="/pricing" className="btn-outline">See plans</Link>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="flex aspect-square w-64 items-center justify-center rounded-[48px] bg-white shadow-sm md:w-80">
              <LogoMark size={180} />
            </div>
          </div>
        </section>

        <section className="bg-white py-16" aria-labelledby="how">
          <div className="mx-auto max-w-5xl px-4">
            <h2 id="how" className="text-3xl font-extrabold text-plum">How it works</h2>
            <ol className="mt-8 grid gap-6 sm:grid-cols-2">
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
        </section>

        <section className="mx-auto max-w-5xl px-4 pt-16" aria-labelledby="who">
          <h2 id="who" className="text-3xl font-extrabold text-plum">Made for moments like these</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            <li className="card">
              <h3 className="font-bold">New parents</h3>
              <p className="mt-1 text-muted">A message for their first day of school, their 18th, their wedding. Just in case.</p>
            </li>
            <li className="card">
              <h3 className="font-bold">Grandparents</h3>
              <p className="mt-1 text-muted">The family stories, the recipes, the voice they&apos;ll want to hear again.</p>
            </li>
            <li className="card">
              <h3 className="font-bold">Anyone writing a will</h3>
              <p className="mt-1 text-muted">Your will says who gets what. KeepNear lets you say why, and what they meant to you.</p>
            </li>
          </ul>
          <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl bg-white p-5">
            <p className="flex-1 text-lg">
              <strong>Free</strong> for your first video. Plans from <strong>£2.99 a month</strong> when you want more.
            </p>
            <Link href="/pricing" className="btn">See plans</Link>
            <Link href="/about" className="font-bold text-plum underline">Questions people ask</Link>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16" aria-labelledby="trust">
          <h2 id="trust" className="text-3xl font-extrabold text-plum">Private by design</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="card">
              <h3 className="font-bold">Stored in the UK</h3>
              <p className="mt-1 text-muted">Your keepsakes are encrypted and kept on London servers.</p>
            </div>
            <div className="card">
              <h3 className="font-bold">Nobody watches early</h3>
              <p className="mt-1 text-muted">Not your family, not your solicitor. Only you, until release.</p>
            </div>
            <div className="card">
              <h3 className="font-bold">Never lost if you stop paying</h3>
              <p className="mt-1 text-muted">Your vault is frozen, not deleted, and still released when the time comes.</p>
            </div>
            <div className="card">
              <h3 className="font-bold">You stay in control</h3>
              <p className="mt-1 text-muted">Change recipients or delete anything, any time.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4" aria-labelledby="partners">
          <div className="rounded-3xl bg-plum p-8 text-cream md:p-12">
            <h2 id="partners" className="text-2xl font-extrabold">Solicitors, will writers and funeral directors</h2>
            <p className="mt-2 max-w-2xl opacity-90">
              Offer KeepNear to your clients alongside their will. We&apos;re looking for founding partners in England
              and Wales.
            </p>
            <Link href="/contact?topic=partner" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-cream px-5 font-bold text-plum">
              Talk to us
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
