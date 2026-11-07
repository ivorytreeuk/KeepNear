import Link from "next/link";
import { Logo } from "@/components/Logo";
import { PartnerSignupForm } from "./PartnerSignupForm";

export const metadata = { title: "Register as a partner · KeepNear" };

export default function PartnerSignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-cream">
      <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
        <Link href="/partners" className="mb-4 self-center" aria-label="KeepNear partners">
          <Logo size={44} />
        </Link>
        <p className="mb-6 self-center rounded-full bg-plum px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-cream">Partners</p>
        <PartnerSignupForm />
      </main>
    </div>
  );
}
