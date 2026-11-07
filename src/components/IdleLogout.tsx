"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/** Log out after 15 minutes without activity, with a 1-minute warning first. */
const IDLE_MS = 15 * 60 * 1000;
const WARN_MS = 60 * 1000;
const KEY = "kn-last-activity";

function now() {
  return Date.now();
}

function readShared(): number {
  try {
    return Number(localStorage.getItem(KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeShared(t: number) {
  try {
    localStorage.setItem(KEY, String(t));
  } catch {
    /* private browsing: fall back to this tab only */
  }
}

/** Call from anywhere (e.g. while recording or uploading) to count as activity. */
export function keepAlive() {
  window.dispatchEvent(new Event("kn-keepalive"));
}

export function IdleLogout() {
  const last = useRef(now());
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const loggingOut = useRef(false);

  const touch = useCallback(() => {
    const t = now();
    // Throttle writes to once every 5 seconds.
    if (t - last.current > 5000) writeShared(t);
    last.current = t;
    setSecondsLeft(null);
  }, []);

  useEffect(() => {
    writeShared(now());
    const opts = { passive: true, capture: true } as const;
    const events = ["pointerdown", "keydown", "scroll", "touchstart", "wheel", "mousemove"];
    events.forEach((e) => window.addEventListener(e, touch, opts));
    window.addEventListener("kn-keepalive", touch);
    // A video playing counts as activity, so nobody is logged out mid-message.
    document.addEventListener("timeupdate", touch, true);

    const tick = setInterval(async () => {
      if (loggingOut.current) return;
      const latest = Math.max(last.current, readShared());
      const idle = now() - latest;
      if (idle >= IDLE_MS) {
        loggingOut.current = true;
        await createClient().auth.signOut();
        const here = window.location.pathname;
        window.location.href = here.startsWith("/admin")
          ? "/login/admin?reason=idle"
          : here.startsWith("/partner")
            ? "/partner/login?reason=idle"
            : "/login?reason=idle";
      } else if (idle >= IDLE_MS - WARN_MS) {
        setSecondsLeft(Math.ceil((IDLE_MS - idle) / 1000));
      } else {
        setSecondsLeft(null);
      }
    }, 1000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, touch, opts));
      window.removeEventListener("kn-keepalive", touch);
      document.removeEventListener("timeupdate", touch, true);
      clearInterval(tick);
    };
  }, [touch]);

  if (secondsLeft === null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-plum-dark/50 p-4" role="alertdialog" aria-modal="true" aria-labelledby="idle-h" aria-describedby="idle-d">
      <div className="card w-full max-w-sm text-center">
        <h2 id="idle-h" className="text-xl font-extrabold text-plum">Still there?</h2>
        <p id="idle-d" className="mt-2">
          To keep your vault safe, we&apos;ll log you out in <strong>{secondsLeft} seconds</strong>.
        </p>
        <button type="button" className="btn mt-5 w-full" onClick={touch} autoFocus>
          Keep me logged in
        </button>
      </div>
    </div>
  );
}
