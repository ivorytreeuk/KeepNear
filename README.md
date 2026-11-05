# KeepNear

Your words, kept near to the people you love.

KeepNear lets people record video, photo and document keepsakes inside the app, store them privately, and have them released to named loved ones after death, with the release started by their solicitor or executor.

Owned by Ivory Tree Inc Ltd.

## What's new in v0.2

- Public site: landing, About (with FAQs), Pricing, Contact (messages saved to `contact_messages`)
- "Kept safe" page after saving a keepsake, recommending the next plan up
- Stripe payments: monthly, yearly and Lifetime; upgrades change the existing subscription; billing portal for cards, invoices and cancelling. Products and prices are created in Stripe automatically on first use.
- Settings: name, password, plan and billing
- Security: passkeys (Supabase), two-step verification with an authenticator app, enforced before the vault opens; welcome page after sign-up encourages both

Extra setup for v0.2: run `supabase/migrations/0002_billing_contact.sql`, add the secret variables in `.env.example`, and create a Stripe webhook pointing at `/api/stripe/webhook` listening for `checkout.session.completed`, `customer.subscription.updated` and `customer.subscription.deleted`.

## What was built in v0.1

- Landing page and pricing page
- Sign up, log in, log out (Supabase Auth)
- In-browser video recording straight into a private vault (never saved to the device's photos)
- Photo and document uploads (up to 25 MB)
- Private playback with short-lived signed links
- Recipients per keepsake, release-after-death or milestone date (Plus and above)
- Release holder (solicitor, will writer or executor)
- Plan limits enforced on the server

Not yet built: Stripe payments, the release process itself, partner dashboard, phone apps.

## Stack

Next.js 15 (App Router) · Tailwind CSS 4 · Supabase (Postgres, Auth, Storage, London region) · Vercel

## Setup

1. In Supabase → SQL Editor, run `supabase/migrations/0001_init.sql` once.
2. In Supabase → Authentication → URL Configuration, set the Site URL to `https://keepnear.co.uk` and add `https://keepnear.co.uk/auth/callback` (plus your Vercel preview URL) to Redirect URLs.
3. In Supabase → Storage → Settings, raise the global upload limit to at least 500 MB.
4. In Vercel, import this repo and add the variables in `.env.example`.

Local development: copy `.env.example` to `.env.local`, fill it in, then `npm install && npm run dev`.
