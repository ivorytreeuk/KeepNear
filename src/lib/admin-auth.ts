import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { notFound } from "next/navigation";
import { createClient } from "./supabase/server";

const COOKIE = "kn_admin";
const HOURS = 8;

export function adminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function passcodeConfigured() {
  return Boolean(process.env.ADMIN_PASSCODE && process.env.ADMIN_PASSCODE.length >= 8);
}

function sign(userId: string, exp: number) {
  return createHmac("sha256", process.env.ADMIN_PASSCODE!).update(`${userId}.${exp}`).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** The logged-in user if they're on the admin list, otherwise null. */
export async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !adminEmails().includes(user.email.toLowerCase())) return null;
  return user;
}

async function sessionValid(userId: string) {
  if (!passcodeConfigured()) return false;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  const [expStr, sig] = raw.split(".");
  const exp = Number(expStr);
  if (!exp || exp < Date.now()) return false;
  return safeEqual(sig ?? "", sign(userId, exp));
}

/** For pages: anyone who isn't an admin sees a plain "not found", so the admin area stays hidden. */
export async function adminGate() {
  const user = await getAdminUser();
  if (!user) notFound();
  return { user, unlocked: await sessionValid(user.id), configured: passcodeConfigured() };
}

/** For actions: must be an admin with an unlocked session. */
export async function requireUnlockedAdmin() {
  const user = await getAdminUser();
  if (!user || !(await sessionValid(user.id))) throw new Error("Not authorised");
  return user;
}

export function checkPasscode(input: string) {
  const expected = process.env.ADMIN_PASSCODE;
  if (!expected) return false;
  return safeEqual(input, expected);
}

export async function setAdminSession(userId: string) {
  const exp = Date.now() + HOURS * 3600 * 1000;
  (await cookies()).set(COOKIE, `${exp}.${sign(userId, exp)}`, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: HOURS * 3600,
  });
}

export async function clearAdminSession() {
  (await cookies()).delete(COOKIE);
}
