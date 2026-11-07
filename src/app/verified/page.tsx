import Link from "next/link";
import { Logo, LogoMark } from "@/components/Logo";

export const metadata = { title: "Email confirmed · KeepNear" };

export default async function VerifiedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const nextRaw = sp.next ?? "";
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/vault/welcome";
  const invalid = sp.status === "invalid";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-8 self-center" aria-label="KeepNear home">
        <Logo size={44} />
      </Link>

      {invalid ? (
        <div className="card flex flex-col gap-4">
          <h1 className="text-2xl font-extrabold text-plum">This link has already been used or has expired</h1>
          {sp.for === "reset" ? (
            <>
              <p>Password reset links work once, for one hour. Ask for a fresh one and use the newest email.</p>
              <Link href="/forgot-password" className="btn">Send me a new reset link</Link>
            </>
          ) : (
            <>
              <p>
                If you&apos;ve already confirmed your email, you&apos;re all set: just log in. Otherwise, log in and
                we&apos;ll offer to send you a new confirmation email.
              </p>
              <Link href="/login" className="btn">Log in</Link>
            </>
          )}
        </div>
      ) : (
        <div className="card flex flex-col items-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-cream">
            <LogoMark size={52} />
          </div>
          <h1 className="text-2xl font-extrabold text-plum">You&apos;re verified</h1>
          <p>Your email is confirmed and your KeepNear {next.startsWith("/partner") ? "partner account" : "vault"} is ready.</p>
          <Link href={next} className="btn w-full">{next.startsWith("/partner") ? "Continue to my partner dashboard" : "Continue to my vault"}</Link>
          <p className="rounded-xl bg-cream p-3 text-sm">
            Signed up on a different device, like your laptop? Go back to it and log in. Your account is ready there too.
          </p>
        </div>
      )}
    </main>
  );
}
