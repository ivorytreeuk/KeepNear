import "server-only";
import { randomInt } from "crypto";
import { createAdminClient } from "./supabase/admin";

// No 0/O or 1/I, so it can be read out over the phone.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function looksLikeReference(s: string) {
  return /^KNP-?[A-Z0-9]{6}$/i.test(s.trim());
}

export function normaliseReference(s: string) {
  const raw = s.trim().toUpperCase().replace(/^KNP-?/, "");
  return `KNP-${raw}`;
}

/** A partner reference nobody else has, e.g. KNP-7H3K9Q. */
export async function newReference() {
  const admin = createAdminClient();
  for (let i = 0; i < 10; i++) {
    let code = "";
    for (let j = 0; j < 6; j++) code += ALPHABET[randomInt(ALPHABET.length)];
    const ref = `KNP-${code}`;
    const { data } = await admin.from("partners").select("id").eq("reference", ref).maybeSingle();
    if (!data) return ref;
  }
  throw new Error("Could not create a partner reference");
}
