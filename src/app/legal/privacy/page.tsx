import Link from "next/link";
import { LegalLayout } from "@/components/LegalLayout";
import { LEGAL } from "@/lib/legal";

export const metadata = { title: "Privacy Policy · KeepNear" };

export default function PrivacyPage() {
  return (
    <LegalLayout
      current="/legal/privacy"
      title="Privacy Policy"
      intro="What you keep in KeepNear is some of the most personal information you'll ever share. This page explains what we collect, why, who helps us run the service, how long we keep things, and the rights you have. We never sell your data and never use it for advertising."
    >
      <h2>1. Who we are</h2>
      <p>
        KeepNear is run by {LEGAL.company}, a company registered in England and Wales (company number{" "}
        {LEGAL.companyNumber}), of {LEGAL.address}. We are the &ldquo;controller&rdquo; of the personal data described
        here, which means we decide how and why it is used.
      </p>
      <p>
        {LEGAL.icoNumber
          ? `We are registered with the Information Commissioner's Office (ICO) under registration number ${LEGAL.icoNumber}.`
          : "Our registration with the Information Commissioner's Office (ICO) is in progress, and our registration number will appear here once issued."}
      </p>
      <p>
        You can contact us about anything on this page at <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>.
      </p>

      <h2>2. What we collect</h2>
      <h3>About you, the account holder</h3>
      <ul>
        <li><strong>Account details:</strong> your name, email address and password (stored only as a secure hash, never readable by us).</li>
        <li><strong>Security details:</strong> whether you&apos;ve set up two-step verification or passkeys, and the technical information needed to check them. We never see your fingerprint or face; that stays on your device.</li>
        <li><strong>Your keepsakes:</strong> the videos you record, and the photos and documents you upload, with their titles, notes and release settings.</li>
        <li><strong>Payment details:</strong> your plan, billing history and the last four digits and expiry of your card. Your full card number is handled by Stripe, our payment provider, and never reaches us.</li>
        <li><strong>Technical information:</strong> your IP address, browser type and the time of each request, which our hosting providers record in short-lived logs to keep the service secure.</li>
        <li><strong>Messages to us:</strong> anything you send through our contact form or by email.</li>
      </ul>
      <h3>About other people you tell us about</h3>
      <ul>
        <li><strong>Recipients:</strong> the name, relationship and email address of each person you choose to receive a keepsake.</li>
        <li><strong>Your release holder:</strong> the name, role, firm, email and phone number of the solicitor, will writer, executor or other person you nominate.</li>
        <li><strong>People in your keepsakes:</strong> anyone who appears or is mentioned in what you record or upload.</li>
      </ul>
      <p>
        Please only add someone&apos;s details if you&apos;re comfortable they would expect it, and tell your release
        holder you&apos;ve named them. We don&apos;t contact recipients until a release takes place. We may contact a
        release holder before then, for example to confirm their details are still correct.
      </p>

      <h3>Sensitive information</h3>
      <p>
        Your videos and documents may reveal things the law treats as especially sensitive, such as your health,
        religion or family circumstances. We process this only to store your keepsakes and deliver them as you&apos;ve
        asked, relying on your explicit choice to record and save them. We don&apos;t analyse, profile or tag the
        content of your keepsakes, and we don&apos;t use them to train AI.
      </p>

      <h2>3. Why we use it, and our legal basis</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">What we do</th>
              <th scope="col">Legal basis under UK GDPR</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Create and run your account and vault, store your keepsakes and release them as you instruct</td><td>Contract with you</td></tr>
            <tr><td>Take payments and manage your plan</td><td>Contract with you</td></tr>
            <tr><td>Keep the service secure, prevent fraud and investigate misuse</td><td>Our legitimate interests in running a safe service</td></tr>
            <tr><td>Hold recipients&apos; and release holders&apos; details and contact them when a release happens</td><td>Our legitimate interests, and yours, in your keepsakes reaching the right people</td></tr>
            <tr><td>Reply to messages and support requests</td><td>Our legitimate interests in answering you</td></tr>
            <tr><td>Keep financial records</td><td>Legal obligation (UK tax law)</td></tr>
            <tr><td>Send service emails, such as sign-up confirmation, payment receipts and security alerts</td><td>Contract with you</td></tr>
          </tbody>
        </table>
      </div>
      <p>We don&apos;t send marketing emails unless you&apos;ve asked to receive them, and you can stop them at any time.</p>

      <h2>4. Who helps us run KeepNear</h2>
      <p>
        We use a small number of trusted companies to provide the service. They act on our instructions, under written
        contracts that require them to protect your data.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Provider</th>
              <th scope="col">What they do</th>
              <th scope="col">Where data is held</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Supabase</td><td>Database, file storage for your keepsakes, logins and sign-up emails</td><td>London, UK</td></tr>
            <tr><td>Vercel</td><td>Hosts the website and app</td><td>Global network; request logs may be processed in the US</td></tr>
            <tr><td>Stripe</td><td>Payments and billing</td><td>UK, EU and US</td></tr>
            <tr><td>Cloudflare</td><td>Domain name service and forwarding emails sent to {LEGAL.email}</td><td>Global network</td></tr>
            <tr><td>Google Fonts</td><td>Supplies the typeface used on our pages, which means your browser shares your IP address with Google</td><td>Global network</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        Your keepsakes themselves are stored in the UK. Where a provider handles data outside the UK, the transfer is
        protected by UK adequacy regulations (including the UK–US Data Bridge) or by the ICO&apos;s International Data
        Transfer Agreement or Addendum.
      </p>
      <p>
        Otherwise, we only share personal data if the law requires it, to protect someone&apos;s safety, or if the
        business is sold, in which case the buyer must keep to this policy.
      </p>

      <h2>5. Who can see your keepsakes</h2>
      <ul>
        <li><strong>You</strong>, whenever you&apos;re logged in.</li>
        <li><strong>Your chosen recipients</strong>, only after a release, and only the keepsakes you assigned to them.</li>
        <li><strong>Your release holder never sees your keepsakes.</strong> They can only start a release.</li>
        <li>
          <strong>Our staff</strong> don&apos;t open or watch your keepsakes. The only exception would be if the law
          required it, or to investigate a serious report that the service is being used to harm someone.
        </li>
      </ul>

      <h2>6. How we protect it</h2>
      <ul>
        <li>Everything is encrypted when it travels between your device and us, and when it&apos;s stored.</li>
        <li>Database rules mean each account can only reach its own vault.</li>
        <li>Files are never public. Viewing uses short-lived private links that expire within minutes.</li>
        <li>Videos are recorded inside KeepNear and are not saved to your device&apos;s photo library.</li>
        <li>You can add passkeys and two-step verification to your account, and we strongly encourage it.</li>
      </ul>
      <p>
        No system is perfectly secure. If we ever have a breach that puts your information at risk, we will tell you
        and the ICO as the law requires.
      </p>

      <h2>7. How long we keep things</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Information</th>
              <th scope="col">How long</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Your account and keepsakes</td><td>For as long as your account is open, including if you stop paying (your vault is frozen, not deleted), until released or until you delete them</td></tr>
            <tr><td>A keepsake you delete</td><td>Removed straight away from the app, and from our backups within 30 days</td></tr>
            <tr><td>Your account, if you close it</td><td>Deleted straight away, and from backups within 30 days</td></tr>
            <tr><td>Released keepsakes</td><td>Available to each recipient for 12 months after release so they can download their copy, then deleted</td></tr>
            <tr><td>Payment and invoice records</td><td>6 years after the end of the tax year they relate to, as UK tax law requires</td></tr>
            <tr><td>Contact form messages and support emails</td><td>2 years</td></tr>
            <tr><td>Technical and security logs</td><td>Up to 90 days</td></tr>
          </tbody>
        </table>
      </div>

      <h2>8. Your rights</h2>
      <p>Under UK data protection law you can ask us to:</p>
      <ul>
        <li>give you a copy of the personal data we hold about you</li>
        <li>correct anything that&apos;s wrong</li>
        <li>delete your data</li>
        <li>limit how we use it, or object to us using it on the basis of legitimate interests</li>
        <li>give you your data in a format you can take elsewhere</li>
      </ul>
      <p>
        You can change most details yourself in <Link href="/vault/settings">Settings</Link>, delete any keepsake at
        any time, and close your account from Settings. For anything else, email{" "}
        <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>. We&apos;ll reply within one month and won&apos;t charge
        you. We may ask you to confirm your identity first, to stop anyone else getting at your vault.
      </p>
      <p>
        These rights also belong to recipients and release holders you&apos;ve named. If one of them contacts us,
        we&apos;ll handle their request fairly while protecting your keepsakes until release.
      </p>

      <h2>9. After you die</h2>
      <p>
        UK data protection law stops applying to a person&apos;s data after they die, but we keep treating your vault
        with the same care. We release your keepsakes only through the process in our{" "}
        <Link href="/legal/terms#release">Terms of Use</Link>, and only to the people you chose.
      </p>

      <h2>10. Children</h2>
      <p>
        You must be 18 or over to open a KeepNear account. You can, of course, leave keepsakes for children. We hold a
        child recipient&apos;s name and the email address you give us, and deliver to them only as you&apos;ve
        instructed.
      </p>

      <h2>11. Cookies</h2>
      <p>
        We only use cookies that are needed to keep you logged in and the service secure. There are no advertising or
        tracking cookies. Details are in our <Link href="/legal/cookies">Cookie Policy</Link>.
      </p>

      <h2>12. Complaints</h2>
      <p>
        If you&apos;re unhappy with how we&apos;ve handled your information, please tell us first at{" "}
        <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> so we can try to put it right. You also have the right to
        complain to the Information Commissioner&apos;s Office at{" "}
        <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer">ico.org.uk/make-a-complaint</a>{" "}
        or on 0303 123 1113.
      </p>

      <h2>13. Changes to this policy</h2>
      <p>
        If we change this policy in a way that matters, we&apos;ll email you before the change takes effect. The date
        at the top always shows the latest version.
      </p>
    </LegalLayout>
  );
}
