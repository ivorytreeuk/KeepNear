import Link from "next/link";
import { fmtLimit, getPlan, nextPlan } from "@/lib/plans";

/** Shows what the next plan up adds, compared with the user's current plan. */
export function NextPlanCard({ currentPlanId }: { currentPlanId: string | null | undefined }) {
  const current = getPlan(currentPlanId);
  const next = nextPlan(current.id);
  if (!next) return null;

  const rows: { label: string; now: string; then: string }[] = [
    { label: "Videos", now: String(current.videos), then: String(next.videos) },
    { label: "Minutes per video", now: String(current.videoMinutes), then: String(next.videoMinutes) },
    { label: "Photos", now: String(current.photos), then: String(next.photos) },
    { label: "Documents", now: String(current.documents), then: String(next.documents) },
    { label: "People to leave them for", now: fmtLimit(current.recipients), then: fmtLimit(next.recipients) },
  ].filter((r) => r.now !== r.then);

  const unlocksMilestones = next.milestones && !current.milestones;
  const price = next.oneOff ?? `${next.monthly} a month`;

  return (
    <section className="card" aria-labelledby="next-plan">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">Room for more?</p>
      <h2 id="next-plan" className="mt-1 text-2xl font-extrabold text-plum">
        {next.name} gives you more space, for {price}
      </h2>

      {unlocksMilestones && (
        <p className="mt-3 rounded-xl bg-cream p-3">
          <strong>New with {next.name}:</strong> pick a date for each message, so a video turns up on her 18th
          birthday or his wedding day, years from now.
        </p>
      )}

      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="text-muted">
            <th scope="col" className="py-2 font-bold"> </th>
            <th scope="col" className="py-2 font-bold">{current.name} (now)</th>
            <th scope="col" className="py-2 font-bold text-plum">{next.name}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-t border-line">
              <th scope="row" className="py-2 font-normal">{r.label}</th>
              <td className="py-2">{r.now}</td>
              <td className="py-2 font-extrabold text-plum">{r.then}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <form action="/api/checkout" method="post" className="mt-5 flex flex-wrap items-center gap-3">
        <input type="hidden" name="plan" value={next.id} />
        <input type="hidden" name="interval" value="monthly" />
        <button type="submit" className="btn">Move to {next.name}</button>
        <Link href="/pricing" className="font-bold text-plum underline">Compare all plans</Link>
      </form>
    </section>
  );
}
