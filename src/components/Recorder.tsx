"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, VAULT_BUCKET } from "@/lib/supabase/client";
import { abandonKeepsake, finishKeepsake, startKeepsake } from "@/app/vault/actions";
import { keepAlive } from "./IdleLogout";

type Stage = "idle" | "live" | "recording" | "review" | "saving";

function pickMimeType() {
  const options = [
    "video/mp4;codecs=avc1,mp4a",
    "video/mp4",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  if (typeof MediaRecorder === "undefined") return "";
  return options.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function Recorder({ maxSeconds }: { maxSeconds: number }) {
  const router = useRouter();
  const liveRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [stage, setStage] = useState<Stage>("idle");
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  useEffect(() => {
    return () => {
      stopStream();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  async function openCamera(mode = facing) {
    setError(null);
    stopStream();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      setStage("live");
      requestAnimationFrame(() => {
        if (liveRef.current) {
          liveRef.current.srcObject = stream;
          liveRef.current.play().catch(() => {});
        }
      });
    } catch {
      setError(
        "We couldn't open your camera. Please allow camera and microphone access in your browser settings, then try again."
      );
    }
  }

  function flipCamera() {
    const next = facing === "user" ? "environment" : "user";
    setFacing(next);
    openCamera(next);
  }

  function startRecording() {
    const stream = streamRef.current;
    if (!stream) return;
    const mimeType = pickMimeType();
    let rec: MediaRecorder;
    try {
      rec = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        videoBitsPerSecond: 1_500_000,
        audioBitsPerSecond: 96_000,
      });
    } catch {
      setError("Recording isn't supported in this browser. Please try Safari on iPhone or Chrome on Android or a laptop.");
      return;
    }
    chunksRef.current = [];
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    rec.onstop = () => {
      const type = rec.mimeType || mimeType || "video/webm";
      const b = new Blob(chunksRef.current, { type });
      setBlob(b);
      setBlobUrl(URL.createObjectURL(b));
      stopStream();
      setStage("review");
    };
    recorderRef.current = rec;
    rec.start(1000);
    setSeconds(0);
    setStage("recording");
    const started = Date.now();
    let lastPing = started;
    timerRef.current = setInterval(() => {
      const s = (Date.now() - started) / 1000;
      setSeconds(s);
      if (Date.now() - lastPing > 10000) {
        lastPing = Date.now();
        keepAlive(); // recording counts as activity, so nobody is logged out mid-message
      }
      if (s >= maxSeconds) stopRecording();
    }, 250);
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  function recordAgain() {
    setBlob(null);
    setBlobUrl(null);
    setSeconds(0);
    openCamera();
  }

  async function save() {
    if (!blob) return;
    setError(null);
    setStage("saving");
    setProgress("Saving to your vault…");
    const ping = setInterval(keepAlive, 10000);

    const mimeType = blob.type.split(";")[0] || "video/webm";
    const started = await startKeepsake({
      kind: "video",
      title: title || "Untitled message",
      mimeType,
      sizeBytes: blob.size,
      durationSeconds: Math.round(seconds),
    });
    if ("error" in started) {
      clearInterval(ping);
      setError(started.error);
      setStage("review");
      setProgress(null);
      return;
    }

    const supabase = createClient();
    const { error: upErr } = await supabase.storage
      .from(VAULT_BUCKET)
      .upload(started.path, blob, { contentType: mimeType, upsert: false });

    if (upErr) {
      clearInterval(ping);
      await abandonKeepsake(started.id);
      setError("The upload didn't finish. Check your connection and try again. Your recording is still here.");
      setStage("review");
      setProgress(null);
      return;
    }

    await finishKeepsake(started.id);
    clearInterval(ping);
    router.push(`/vault/${started.id}?new=1`);
  }

  const remaining = Math.max(0, maxSeconds - seconds);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-3xl bg-plum-dark" style={{ aspectRatio: "3 / 4", maxHeight: "70vh" }}>
        {(stage === "live" || stage === "recording") && (
          <video
            ref={liveRef}
            muted
            playsInline
            autoPlay
            className="h-full w-full object-cover"
            style={{ transform: facing === "user" ? "scaleX(-1)" : undefined }}
          />
        )}
        {(stage === "review" || stage === "saving") && blobUrl && (
          <video
            src={blobUrl}
            controls
            playsInline
            controlsList="nodownload noplaybackrate"
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}
            className="h-full w-full bg-black object-contain"
          />
        )}
        {stage === "idle" && (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-cream">
            <p className="text-lg font-bold">Ready when you are</p>
            <p className="text-sm opacity-80">
              Your video goes straight into your private vault. It isn&apos;t saved to your phone&apos;s photos.
            </p>
          </div>
        )}
        {stage === "recording" && (
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-sm font-bold text-white">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" aria-hidden="true" />
            {fmt(seconds)} <span className="font-normal opacity-80">· {fmt(remaining)} left</span>
          </div>
        )}
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {stage === "idle" && (
          <button type="button" className="btn" onClick={() => openCamera()}>Turn on camera</button>
        )}
        {stage === "live" && (
          <>
            <button type="button" className="btn" onClick={startRecording}>
              <span className="h-3 w-3 rounded-full bg-red-500" aria-hidden="true" /> Start recording
            </button>
            <button type="button" className="btn-outline" onClick={flipCamera}>Switch camera</button>
          </>
        )}
        {stage === "recording" && (
          <button type="button" className="btn" onClick={stopRecording}>
            <span className="h-3 w-3 rounded-sm bg-cream" aria-hidden="true" /> Stop
          </button>
        )}
      </div>

      {(stage === "review" || stage === "saving") && (
        <form
          className="card flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <label className="flex flex-col gap-1 font-bold">
            Give it a title
            <input
              className="field font-normal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="For Mia's 18th birthday"
              maxLength={120}
              required
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn" disabled={stage === "saving"}>
              {stage === "saving" ? progress : "Save to vault"}
            </button>
            <button type="button" className="btn-outline" onClick={recordAgain} disabled={stage === "saving"}>
              Record again
            </button>
          </div>
          <p className="text-xs text-muted">Recorded {fmt(seconds)}. You can choose who receives it on the next screen.</p>
        </form>
      )}
    </div>
  );
}
