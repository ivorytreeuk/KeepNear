import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/VaultHeader";
import { Recorder } from "@/components/Recorder";
import { getPlan } from "@/lib/plans";

export const metadata = { title: "Record a message · KeepNear" };

export default async function RecordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user!.id).single();
  const plan = getPlan(profile?.plan);
  const { count } = await supabase
    .from("keepsakes")
    .select("id", { count: "exact", head: true })
    .eq("kind", "video");
  const full = (count ?? 0) >= plan.videos;

  return (
    <PageShell>
      <Link href="/vault" className="text-sm font-bold text-plum underline">← Back to vault</Link>
      <h1 className="mt-3 text-3xl font-extrabold text-plum">Record a message</h1>
      <p className="mt-1 text-muted">Up to {plan.videoMinutes} minutes on your {plan.name} plan. Take your time.</p>

      <div className="mx-auto mt-6 max-w-md">
        {full ? (
          <div className="card text-center">
            <p className="font-bold">You&apos;ve used all {plan.videos} video{plan.videos === 1 ? "" : "s"} on your plan.</p>
            <Link href="/vault/plan" className="btn mt-4">See plans</Link>
          </div>
        ) : (
          <Recorder maxSeconds={plan.videoMinutes * 60} />
        )}
      </div>
    </PageShell>
  );
}
