import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Logo, LogoMark } from "@/components/Logo";
import { ProtectedMedia } from "@/components/ProtectedMedia";

export const metadata = { title: "A message for you · KeepNear", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-10">
      <Link href="/" className="mb-8 self-center" aria-label="KeepNear home">
        <Logo size={40} />
      </Link>
      {children}
    </main>
  );
}

function ext(mime: string | null, path: string) {
  const fromPath = path.split(".").pop();
  return fromPath && fromPath.length <= 5 ? fromPath : (mime?.split("/")[1] ?? "file");
}

export default async function ReceivePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: d } = await admin
    .from("deliveries")
    .select("id, status, opened_at, expires_at, recipients(full_name), keepsakes(id, title, note, kind, mime_type, storage_path, category, owner_id)")
    .eq("token", token)
    .maybeSingle();

  const k = d?.keepsakes as unknown as {
    title: string;
    note: string | null;
    kind: string;
    mime_type: string | null;
    storage_path: string;
    category: string;
    owner_id: string;
  } | null;

  if (!d || d.status !== "sent" || !k) {
    return (
      <Shell>
        <div className="card text-center">
          <h1 className="text-2xl font-extrabold text-plum">We couldn&apos;t find this message</h1>
          <p className="mt-2">
            The link may be incomplete. Try opening it straight from the email again, or contact us at{" "}
            <a href="mailto:info@keepnear.co.uk" className="font-bold text-plum underline">info@keepnear.co.uk</a> and
            we&apos;ll help.
          </p>
        </div>
      </Shell>
    );
  }

  if (d.expires_at && new Date(d.expires_at) < new Date()) {
    return (
      <Shell>
        <div className="card text-center">
          <h1 className="text-2xl font-extrabold text-plum">This link has expired</h1>
          <p className="mt-2">
            Messages stay available for 12 months after delivery. If you didn&apos;t get the chance to save a copy, please
            email <a href="mailto:info@keepnear.co.uk" className="font-bold text-plum underline">info@keepnear.co.uk</a> and
            we&apos;ll see what we can do.
          </p>
        </div>
      </Shell>
    );
  }

  if (!d.opened_at) await admin.from("deliveries").update({ opened_at: new Date().toISOString() }).eq("id", d.id);

  const [{ data: owner }, view, download] = await Promise.all([
    admin.from("profiles").select("full_name").eq("id", k.owner_id).single(),
    admin.storage.from("vault").createSignedUrl(k.storage_path, 60 * 60),
    admin.storage.from("vault").createSignedUrl(k.storage_path, 60 * 60, {
      download: `${k.title.replace(/[^\w\- ]+/g, "").trim() || "keepnear"}.${ext(k.mime_type, k.storage_path)}`,
    }),
  ]);
  const from = owner?.full_name || "Someone who loves you";
  const recipient = (d.recipients as unknown as { full_name: string } | null)?.full_name?.split(" ")[0];

  return (
    <Shell>
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-white">
          <LogoMark size={52} />
        </div>
        <p className="mt-5 text-sm font-bold uppercase tracking-wider text-muted">
          {recipient ? `For ${recipient}, from ${from}` : `From ${from}`}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-plum">{k.title}</h1>
      </div>

      <div className="mt-8">
        {view.data?.signedUrl ? (
          <ProtectedMedia kind={k.kind} url={view.data.signedUrl} title={k.title} />
        ) : (
          <p className="card">This file couldn&apos;t be loaded. Please refresh, or email info@keepnear.co.uk.</p>
        )}
      </div>

      {k.note && (
        <blockquote className="card mt-6 whitespace-pre-line text-lg italic">&ldquo;{k.note}&rdquo;</blockquote>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {download.data?.signedUrl && (
          <a href={download.data.signedUrl} className="btn">Download your own copy</a>
        )}
      </div>
      <p className="mt-4 text-center text-sm text-muted">
        This link works for 12 months{d.expires_at ? `, until ${new Date(d.expires_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}` : ""}. We recommend
        saving a copy somewhere safe.
      </p>
      <p className="mt-10 text-center text-sm text-muted">
        Want to leave something like this for the people you love?{" "}
        <Link href="/" className="font-bold text-plum underline">Find out about KeepNear</Link>
      </p>
    </Shell>
  );
}
