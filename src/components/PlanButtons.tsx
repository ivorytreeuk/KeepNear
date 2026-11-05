import Link from "next/link";
import type { Plan } from "@/lib/plans";

/** Buttons that start checkout for a plan. Logged-out visitors are sent to sign up first. */
export function PlanButtons({
  plan,
  loggedIn,
  primary = false,
}: {
  plan: Plan;
  loggedIn: boolean;
  primary?: boolean;
}) {
  const main = primary ? "btn" : "btn-outline";

  if (plan.id === "free") {
    return (
      <Link href={loggedIn ? "/vault" : "/signup"} className="btn-outline w-full">
        {loggedIn ? "Go to your vault" : "Start free"}
      </Link>
    );
  }

  if (plan.id === "lifetime") {
    return (
      <form action="/api/checkout" method="post">
        <input type="hidden" name="plan" value="lifetime" />
        <button type="submit" className={`${main} w-full`}>Pay {plan.oneOff}</button>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <form action="/api/checkout" method="post">
        <input type="hidden" name="plan" value={plan.id} />
        <input type="hidden" name="interval" value="monthly" />
        <button type="submit" className={`${main} w-full`}>{plan.monthly} a month</button>
      </form>
      <form action="/api/checkout" method="post">
        <input type="hidden" name="plan" value={plan.id} />
        <input type="hidden" name="interval" value="annual" />
        <button type="submit" className="btn-outline w-full">{plan.annual} a year (2 months free)</button>
      </form>
    </div>
  );
}
