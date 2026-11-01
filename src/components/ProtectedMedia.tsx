"use client";

export function ProtectedMedia({ kind, url, title }: { kind: string; url: string; title: string }) {
  if (kind === "video") {
    return (
      <video
        src={url}
        controls
        playsInline
        preload="metadata"
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        className="w-full rounded-2xl bg-black"
        style={{ maxHeight: "70vh" }}
      />
    );
  }
  if (kind === "photo") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={title}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        className="w-full rounded-2xl bg-white object-contain"
        style={{ maxHeight: "70vh" }}
      />
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="btn-outline">
      Open document
    </a>
  );
}
