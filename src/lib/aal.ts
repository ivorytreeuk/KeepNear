import type { SupabaseClient } from "@supabase/supabase-js";

/** True when the user has two-step verification on but hasn't entered their code this session. */
export async function needsSecondStep(supabase: SupabaseClient) {
  try {
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    return data?.nextLevel === "aal2" && data?.currentLevel !== "aal2";
  } catch {
    return false;
  }
}
