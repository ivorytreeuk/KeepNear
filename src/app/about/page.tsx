import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const metadata = { title: "About · KeepNear" };

const QUESTIONS = [
  {
    q: "Is a KeepNear video part of my will?",
    a: "No. In England and Wales a will still has to be written, signed and witnessed. KeepNear sits alongside it: mention your vault in your will or letter of wishes, and name your solicitor or executor as your release holder.",
  },
  {
    q: "Who can watch my videos before I die?",
    a: "Only you. Not your family, not your release holder, not our staff. Your release holder can start the release, but they can never open anything.",
  },
  {
    q: "How do you know when to release them?",
    a: "Your release holder tells us and sends the death certificate. We hold everything for 14 days and contact you on every email and number we have, in case it's a mistake. Then each person receives only what was meant for them.",
  },
  {
    q: "What if I stop paying?",
    a: "Your vault is frozen, never deleted. You can't add more until you pick a plan again, but everything already in there is still released when the time comes.",
  },
  {
    q: "Why can't I upload videos from my camera roll?",
    a: "On purpose. Recording inside KeepNear means the message never sits in your phone's photos, where family might stumble on it or it might be backed up somewhere you don't control.",
  },
  {
    q: "Where is everything stored?",
    a: "On encrypted servers in London. We never sell your data or use it for advertising.",
  },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-4xl font-extrabold text-plum">About KeepNear</h1>
        <div className="mt-5 space-y-4 text-lg">
          <p>
            Most of us have things we&apos;d want to say to the people we love, and never quite get round to. A message
            for a daughter&apos;s wedding day. Advice for a son&apos;s 18th. A thank-you we never said out loud.
          </p>
          <p>
            KeepNear gives those words somewhere safe to wait. You record them in your own voice, choose exactly who
            each one is for, and we keep them sealed until the moment they&apos;re meant for.
          </p>
          <p>
            We built it in Derbyshire, in the UK, to work the way a will does: quietly in the background, with a
            solicitor or executor you trust making sure it reaches the right people.
          </p>
        </div>

        <h2 className="mt-12 text-2xl font-extrabold text-plum">Questions people ask</h2>
        <div className="mt-4 flex flex-col gap-3">
          {QUESTIONS.map((item) => (
            <details key={item.q} className="card">
              <summary className="cursor-pointer text-lg font-bold">{item.q}</summary>
              <p className="mt-2 text-muted">{item.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/signup" className="btn">Record your first message free</Link>
          <Link href="/contact" className="btn-outline">Ask us something</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
