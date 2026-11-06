"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isValidQuestion } from "@/lib/security-questions";

type Result = { error?: string; existing?: boolean; session?: boolean };

export async function signUpAction(input: {
  fullName: string;
  email: string;
  password: string;
  confirm: string;
  question: string;
  answer: string;
  next: string;
}): Promise<Result> {
  const fullName = input.fullName.trim().slice(0, 120);
  const email = input.email.trim();
  if (!fullName || !email) return { error: "Please fill in your name and email." };
  if (input.password.length < 8) return { error: "Your password needs at least 8 characters." };
  if (input.password !== input.confirm) return { error: "The two passwords don't match." };
  if (!isValidQuestion(input.question)) return { error: "Please choose a security question." };
  if (input.answer.trim().length < 2) return { error: "Please give an answer to your security question." };

  const next = input.next.startsWith("/") && !input.next.startsWith("//") ? input.next : "/vault/welcome";
  const h = await headers();
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || h.get("origin") || "").replace(/\/$/, "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: { full_name: fullName, terms_accepted_at: new Date().toISOString(), terms_version: "2026-11-05" },
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) return { error: error.message };

  // Supabase returns a user with no identities when the email is already registered.
  if (data.user && (data.user.identities ?? []).length === 0) return { existing: true };

  if (data.user) {
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      await createAdminClient().rpc("set_security_answer_for", {
        p_user: data.user.id,
        p_question: input.question,
        p_answer: input.answer,
      });
    } catch {
      // If this fails, the user is asked to set a question in Settings instead.
    }
  }

  return { session: Boolean(data.session) };
}
