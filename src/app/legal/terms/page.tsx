import Link from "next/link";
import { LegalLayout } from "@/components/LegalLayout";
import { LEGAL } from "@/lib/legal";

export const metadata = { title: "Terms of Use · KeepNear" };

export default function TermsPage() {
  return (
    <LegalLayout
      current="/legal/terms"
      title="Terms of Use"
      intro="These terms are the agreement between you and us when you use KeepNear. We've written them to be read, not skimmed past. The short version: your keepsakes belong to you, we keep them private, and we release them only to the people you choose, in the way set out below."
    >
      <h2>1. About these terms</h2>
      <p>
        KeepNear is provided by {LEGAL.company} (&ldquo;we&rdquo;, &ldquo;us&rdquo;), a company registered in England
        and Wales, company number {LEGAL.companyNumber}, of {LEGAL.address}. You can contact us at{" "}
        <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>.
      </p>
      <p>
        By creating an account you agree to these terms and to our <Link href="/legal/privacy">Privacy Policy</Link>.
        If you don&apos;t agree, please don&apos;t use KeepNear.
      </p>

      <h2>2. What KeepNear is, and what it isn&apos;t</h2>
      <p>
        KeepNear lets you record videos and store photos and documents (&ldquo;keepsakes&rdquo;) in a private vault,
        choose who each keepsake is for (&ldquo;recipients&rdquo;), and have them delivered after your death, or on a
        date you choose after your death, once your death has been confirmed through the process in section 7.
      </p>
      <p>
        <strong>KeepNear is not a will and is not legal advice.</strong> A keepsake cannot pass on money, property or
        possessions, appoint guardians or executors, or change your will. In England and Wales a will must be in
        writing, signed and witnessed. We recommend you mention your KeepNear vault in your will or letter of wishes
        and tell your release holder about it, but how you do that is a matter for you and your legal adviser.
      </p>

      <h2>3. Your account</h2>
      <ul>
        <li>You must be 18 or over and able to enter into a contract.</li>
        <li>Your account is for you only. Don&apos;t share your login or let anyone else use your vault.</li>
        <li>Keep your login details safe. We strongly recommend a passkey or two-step verification.</li>
        <li>Keep your email address up to date, because we use it for security alerts and, if a release is started, to check with you first.</li>
        <li>Tell us straight away at <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> if you think someone else has got into your account.</li>
      </ul>

      <h2>4. Your keepsakes</h2>
      <h3>They belong to you</h3>
      <p>
        You keep all rights in what you record and upload. You give us permission to store, copy (for backups),
        convert (so it plays on different devices) and deliver your keepsakes, only so we can provide KeepNear to you.
        This permission continues after your death so we can complete releases you&apos;ve set up, and ends when a
        keepsake is deleted.
      </p>
      <h3>What you can put in your vault</h3>
      <p>You agree that you won&apos;t record or upload anything that:</p>
      <ul>
        <li>is illegal, or encourages anyone to break the law</li>
        <li>threatens, harasses or is intended to frighten or cause distress to a recipient or anyone else</li>
        <li>contains sexual content involving anyone under 18, or any intimate images of another person without their consent</li>
        <li>you don&apos;t have the right to share, such as someone else&apos;s copyrighted film or music</li>
        <li>contains viruses or anything designed to damage devices</li>
      </ul>
      <p>
        If you include other people in your keepsakes, please be fair to them. You are responsible for what you record
        and for any statements you make about others.
      </p>
      <h3>Deleting keepsakes</h3>
      <p>
        You can delete any keepsake at any time. Once deleted it cannot be recovered and will not be released. It is
        removed from our backups within 30 days.
      </p>

      <h2>5. Recipients</h2>
      <p>
        You choose who receives each keepsake. Please give accurate contact details and keep them up to date. If we
        can&apos;t reach a recipient after reasonable efforts (including through your release holder), we will hold
        their keepsakes for 12 months from release in case they get in touch, and then delete them.
      </p>

      <h2>6. Your release holder</h2>
      <p>
        Your release holder is the person you trust to tell us when you have died, usually a solicitor, will writer or
        executor. They can start a release but can never view or open your keepsakes. You should tell them you have
        named them and how to contact us. You can change your release holder at any time in your vault.
      </p>

      <h2 id="release">7. How a release works</h2>
      <ol>
        <li>Your release holder tells us you have died and sends us a copy of the death certificate or other official proof we reasonably ask for.</li>
        <li>We check the documents, and that the request comes from the release holder you named.</li>
        <li>
          We then hold everything for <strong>14 days</strong> and contact you on every email address and phone number
          we have. If you are alive and reply, the release is stopped and nothing is shared.
        </li>
        <li>
          After 14 days, each recipient receives a private invitation to view and download only the keepsakes you
          chose for them. They may need to confirm their identity first.
        </li>
        <li>
          Keepsakes you scheduled for a later date (for example, a birthday or wedding day) are held and delivered on
          that date.
        </li>
        <li>Recipients can view and download their keepsakes for 12 months after delivery, after which we delete them.</li>
      </ol>
      <p>
        If you haven&apos;t named a release holder, or yours can&apos;t act, we may accept a request from your executor
        or personal representative with proof of their role and your death. We may refuse or pause a release if we
        have reason to think a request is mistaken, fraudulent or disputed, and we won&apos;t release anything while a
        court order or legal dispute prevents it.
      </p>
      <p>
        We take great care over releases, but we rely on the information given to us. We aren&apos;t responsible for
        delays or failures caused by out-of-date contact details, a release holder not contacting us, or false
        information given to us by someone else.
      </p>

      <h2>8. Plans and payment</h2>
      <ul>
        <li>The Free plan is free. Paid plans and their limits are shown on our <Link href="/pricing">pricing page</Link>. Prices are in pounds sterling.</li>
        <li>Monthly and yearly plans renew automatically and are charged at the start of each period until you cancel.</li>
        <li>Lifetime is a single payment for the life of your account. It has no renewal charges.</li>
        <li>If you move to a higher plan, you pay the difference for the rest of the current period straight away. If you move to a lower plan, the difference is credited against future bills.</li>
        <li>We&apos;ll give you at least 30 days&apos; notice by email before any price increase applies to you, and you can cancel before it does.</li>
        <li>Payments are taken by Stripe. Their terms apply to the payment itself.</li>
      </ul>

      <h2>9. Cancelling, and your right to change your mind</h2>
      <p>
        <strong>Cancelling:</strong> you can cancel a monthly or yearly plan at any time from Settings. Your plan stays
        active until the end of the period you&apos;ve paid for.
      </p>
      <p>
        <strong>14-day cooling-off period:</strong> when you first buy a paid plan, you have 14 days to change your
        mind. Because the extra space is available straight away, if you cancel within those 14 days we&apos;ll refund
        what you paid minus a fair amount for the days you had the plan. Email{" "}
        <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> to ask for this.
      </p>
      <p>
        <strong>If you stop paying:</strong> your vault is <strong>frozen, not deleted</strong>. You move to the Free
        plan, can&apos;t add new keepsakes beyond its limits, but everything already in your vault stays and will
        still be released as you set up.
      </p>

      <h2>10. Closing your account</h2>
      <p>
        You can close your account at any time from Settings. This permanently deletes your keepsakes, recipients and
        release holder details, and they will never be released. Any active subscription is cancelled.
      </p>

      <h2>11. If we need to suspend or close an account</h2>
      <p>
        We may suspend or close an account if it breaks section 4, is used to harm someone, or if the law requires it.
        Unless the law or safety reasons prevent it, we&apos;ll tell you first and give you the chance to put things
        right or download your keepsakes.
      </p>

      <h2>12. If KeepNear changes or closes</h2>
      <p>
        We work to keep KeepNear running for the long term. If we ever have to close the service, we will give you at
        least 90 days&apos; notice by email so you can download your keepsakes, and we will try to arrange for vaults
        to be passed to another provider who will honour your release instructions. We will refund any unused part of
        a prepaid plan. If you bought Lifetime, we will refund a fair proportion based on how long you had it.
      </p>

      <h2>13. Our responsibility to you</h2>
      <p>
        We provide KeepNear with reasonable care and skill. We store your keepsakes securely and back them up, but no
        online service can promise to be available all the time or that data can never be lost. We aren&apos;t
        responsible for losses we couldn&apos;t reasonably have foreseen, for problems caused by things outside our
        reasonable control, or for business losses.
      </p>
      <p>
        Nothing in these terms limits our responsibility for death or personal injury caused by our negligence, for
        fraud, or for anything else the law doesn&apos;t allow us to exclude. Nothing affects your legal rights as a
        consumer. For information about your rights, contact Citizens Advice.
      </p>

      <h2>14. Changes to these terms</h2>
      <p>
        We may update these terms, for example when we add features or the law changes. If a change matters to you,
        we&apos;ll email you at least 30 days before it applies. If you don&apos;t agree, you can cancel or close your
        account before then.
      </p>

      <h2>15. Complaints and disputes</h2>
      <p>
        If something goes wrong, please email <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> and we&apos;ll aim to
        resolve it within 14 days.
      </p>
      <p>
        These terms are governed by the law of England and Wales, and disputes will be handled by the courts of
        England and Wales. If you live in Scotland or Northern Ireland, you can also bring proceedings in your local
        courts.
      </p>
    </LegalLayout>
  );
}
