import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { ContactForm } from "./ContactForm";

export const metadata = { title: "Contact us · KeepNear" };

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const topic = ["general", "support", "partner", "press"].includes(sp.topic ?? "") ? sp.topic! : "general";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid max-w-5xl gap-10 px-4 py-10 md:grid-cols-[1fr_1.4fr]">
        <div>
          <h1 className="text-4xl font-extrabold text-plum">Get in touch</h1>
          <p className="mt-3 text-lg">
            A question about your vault, or thinking of offering KeepNear to your clients? We&apos;d like to hear from
            you.
          </p>
          <div className="mt-6 flex flex-col gap-4">
            <div>
              <p className="font-bold">Email</p>
              <a href="mailto:info@keepnear.co.uk" className="font-bold text-plum underline">info@keepnear.co.uk</a>
            </div>
            <div>
              <p className="font-bold">Solicitors, will writers and funeral directors</p>
              <p className="text-muted">
                We&apos;re looking for founding partners in England and Wales. Pick &ldquo;Partnering&rdquo; in the form
                and we&apos;ll arrange a call.
              </p>
            </div>
            <div>
              <p className="font-bold">Company</p>
              <p className="text-muted">Ivory Tree Inc Ltd, company no. 14329140, Swadlincote, Derbyshire</p>
            </div>
          </div>
        </div>
        <ContactForm defaultTopic={topic} />
      </main>
      <SiteFooter />
    </>
  );
}
