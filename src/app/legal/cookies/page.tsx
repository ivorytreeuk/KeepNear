import Link from "next/link";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata = { title: "Cookie Policy · KeepNear" };

export default function CookiesPage() {
  return (
    <LegalLayout
      current="/legal/cookies"
      title="Cookie Policy"
      intro="KeepNear only uses cookies that are strictly necessary to log you in and keep your vault secure. We don't use advertising, tracking or analytics cookies, so you won't see a cookie banner here."
    >
      <h2>What cookies are</h2>
      <p>
        Cookies are small files a website stores in your browser. Some are needed for a site to work. Others track you
        for advertising or analytics. We only use the first kind.
      </p>

      <h2>The cookies we use</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Cookie</th>
              <th scope="col">Set by</th>
              <th scope="col">What it does</th>
              <th scope="col">How long</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>sb-…-auth-token</code></td>
              <td>KeepNear (via Supabase)</td>
              <td>Keeps you logged in as you move between pages, so nobody else can reach your vault</td>
              <td>Until you log out (your browser may keep it for up to 400 days)</td>
            </tr>
            <tr>
              <td><code>sb-…-auth-token-code-verifier</code></td>
              <td>KeepNear (via Supabase)</td>
              <td>Makes sure the link in a sign-up or login email is opened by the same person who asked for it</td>
              <td>Until the email link is used</td>
            </tr>
            <tr>
              <td>Stripe cookies (such as <code>__stripe_mid</code>)</td>
              <td>Stripe</td>
              <td>Set only on Stripe&apos;s secure payment page, to process your payment and prevent fraud</td>
              <td>Up to 1 year</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Because these cookies are strictly necessary, the law doesn&apos;t require us to ask for your consent. If you
        block them in your browser, you won&apos;t be able to log in.
      </p>

      <h2>Other things your browser loads</h2>
      <p>
        Our pages load the Nunito typeface from Google Fonts. This doesn&apos;t set cookies, but your browser shares
        your IP address with Google to download it. See our <Link href="/legal/privacy">Privacy Policy</Link> for the
        full list of companies that help us run KeepNear.
      </p>

      <h2>If this changes</h2>
      <p>
        If we ever want to use cookies that aren&apos;t strictly necessary, such as anonymous analytics, we&apos;ll ask
        for your permission first and update this page.
      </p>
    </LegalLayout>
  );
}
