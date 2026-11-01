import Link from "next/link";
import { PageShell } from "@/components/VaultHeader";
import { Uploader } from "@/components/Uploader";

export const metadata = { title: "Add a photo or document · KeepNear" };

export default function UploadPage() {
  return (
    <PageShell>
      <Link href="/vault" className="text-sm font-bold text-plum underline">← Back to vault</Link>
      <h1 className="mt-3 text-3xl font-extrabold text-plum">Add a photo or document</h1>
      <p className="mt-1 text-muted">A letter, a favourite recipe, a photo you want them to have.</p>
      <div className="mt-6 max-w-lg">
        <Uploader />
      </div>
    </PageShell>
  );
}
