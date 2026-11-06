import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/VaultHeader";
import { SecuritySettings } from "@/components/SecuritySettings";
import { SecurityQuestionForm } from "@/components/SecurityQuestionForm";
import { closeAccount, updateName } from "../actions";
import { getPlan } from "@/lib/plans";

export const metadata = { title: "Settings · KeepNear" };

const BILLING_MSG: Record<string, string> = {
  success: "Thank you. Your payment went through and your new plan is ready. It can take a minute to show here.",
  changed: "Your plan has been changed. Any difference in price is added to your next bill.",
  lifetime: "You're on Lifetime, so there's nothing more to pay.",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, plan, plan_interval, stripe_customer_id")
    .eq("id", user!.id)
    .single();
  const { data: sq } = await supabase.from("security_questions").select("question").maybeSingle();
  const plan = getPlan(profile?.plan);
  const intervalLabel =
    profile?.plan_interval === "annual" ? "paid yearly" : profile?.plan_interval === "monthly" ? "paid monthly" : null;

  return (
    <PageShell>
      <h1 className="text-3xl font-extrabold text-plum">Settings</h1>

      {sp.billing && BILLING_MSG[sp.billing] && (
        <p role="status" className="mt-4 rounded-xl bg-white p-3 text-sm">{BILLING_MSG[sp.billing]}</p>
      )}
      {sp.saved === "name" && <p role="status" className="mt-4 rounded-xl bg-white p-3 text-sm">Name saved.</p>}
      {sp.saved === "password" && <p role="status" className="mt-4 rounded-xl bg-white p-3 text-sm">Your new password is saved.</p>}

      <section className="mt-8" aria-labelledby="details-h">
        <h2 id="details-h" className="text-xl font-extrabold text-plum">Your details</h2>
        <form action={updateName} className="card mt-3 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 font-bold">
            Full name
            <input name="full_name" defaultValue={profile?.full_name ?? ""} required maxLength={120} className="field font-normal" />
          </label>
          <div className="flex flex-col gap-1">
            <span className="font-bold">Email</span>
            <span className="field flex items-center bg-cream text-muted">{user!.email}</span>
          </div>
          <button type="submit" className="btn self-start">Save name</button>
        </form>
      </section>

      <section className="mt-10" aria-labelledby="plan-h">
        <h2 id="plan-h" className="text-xl font-extrabold text-plum">Plan and billing</h2>
        <div className="card mt-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-lg font-bold">
              {plan.name}
              {intervalLabel && <span className="font-normal text-muted"> · {intervalLabel}</span>}
            </p>
            <p className="text-sm text-muted">
              {plan.videos} videos · {plan.photos} photos · {plan.documents} documents
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {plan.id !== "lifetime" && <Link href="/pricing" className="btn">Change plan</Link>}
            {profile?.stripe_customer_id && (
              <form action="/api/billing-portal" method="post">
                <button type="submit" className="btn-outline">Card, invoices and cancelling</button>
              </form>
            )}
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">
          If you cancel, your vault is frozen, never deleted, and still released when the time comes.
        </p>
      </section>

      <section id="security" className="mt-10 scroll-mt-6" aria-labelledby="sec-h">
        <h2 id="sec-h" className="text-xl font-extrabold text-plum">Login and security</h2>
        <p className="mt-1 text-sm text-muted">Your vault holds some of the most personal things you&apos;ll ever record. Lock it properly.</p>
        <div className="mt-3 flex flex-col gap-4">
          <SecuritySettings />
          <SecurityQuestionForm current={sq?.question ?? null} />
        </div>
      </section>

      <section id="close" className="mt-10 scroll-mt-6" aria-labelledby="close-h">
        <h2 id="close-h" className="text-xl font-extrabold text-plum">Close your account</h2>
        {sp.close === "confirm" && (
          <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">Type DELETE in capitals to confirm.</p>
        )}
        {sp.close === "unavailable" && (
          <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">
            We couldn&apos;t close your account automatically. Please email info@keepnear.co.uk from your account email and
            we&apos;ll do it within 7 days.
          </p>
        )}
        <details className="card mt-3">
          <summary className="cursor-pointer font-bold text-red-800">I want to close my account</summary>
          <p className="mt-3 text-sm">
            This permanently deletes every keepsake in your vault, your recipients and your release holder. Nothing will
            ever be released. Any subscription is cancelled. This can&apos;t be undone.
          </p>
          <form action={closeAccount} className="mt-4 flex flex-col gap-3">
            <label className="flex flex-col gap-1 font-bold">
              Type DELETE to confirm
              <input name="confirm" required autoComplete="off" className="field max-w-xs font-normal" />
            </label>
            <button type="submit" className="inline-flex min-h-11 items-center self-start rounded-full bg-red-800 px-5 font-bold text-white">
              Close my account and delete everything
            </button>
          </form>
        </details>
      </section>
    </PageShell>
  );
}
