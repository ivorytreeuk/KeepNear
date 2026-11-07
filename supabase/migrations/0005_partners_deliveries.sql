-- KeepNear: partners, referral tracking, payments, release cases and deliveries.
-- Run once in Supabase → SQL Editor → New query → paste → Run.
-- All new tables are locked down: only KeepNear's server (service role) can read or write them,
-- except partner_applications, which anyone can submit to.

-- Recipients can now have a phone number as well as an email.
alter table public.recipients add column if not exists phone text;

-- ───────── Partners ─────────
create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,60}$'),
  name text not null check (char_length(name) between 2 and 120),
  type text not null default 'solicitor'
    check (type in ('solicitor','will_writer','funeral_director','insurer','financial_adviser','hospice','other')),
  website text,
  description text,
  region text,
  contact_email text,
  phone text,
  commission_rate numeric(5,2) not null default 20 check (commission_rate between 0 and 100),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- People who can log in to a partner's dashboard (matched by their KeepNear account email).
create table if not exists public.partner_members (
  partner_id uuid not null references public.partners (id) on delete cascade,
  email text not null,
  primary key (partner_id, email)
);

-- directory_view: shown in the directory · click: someone clicked through to their website
-- referral_visit: someone arrived at KeepNear from the partner's referral link
create table if not exists public.partner_events (
  id bigint generated always as identity primary key,
  partner_id uuid not null references public.partners (id) on delete cascade,
  type text not null check (type in ('directory_view','click','referral_visit')),
  source text,
  created_at timestamptz not null default now()
);
create index if not exists partner_events_lookup on public.partner_events (partner_id, type, created_at);

alter table public.profiles add column if not exists referred_by uuid references public.partners (id) on delete set null;

-- Every payment received, so revenue can be traced back to a partner.
create table if not exists public.payments (
  id text primary key, -- Stripe invoice or payment id
  user_id uuid references auth.users (id) on delete set null,
  partner_id uuid references public.partners (id) on delete set null,
  amount_pence integer not null,
  currency text not null default 'gbp',
  description text,
  created_at timestamptz not null default now()
);
create index if not exists payments_partner on public.payments (partner_id, created_at);

-- Organisations that want to become partners.
create table if not exists public.partner_applications (
  id uuid primary key default gen_random_uuid(),
  organisation text not null check (char_length(organisation) between 2 and 160),
  type text not null default 'other',
  contact_name text not null check (char_length(contact_name) between 2 and 120),
  email text not null check (char_length(email) between 3 and 200),
  phone text,
  website text,
  region text,
  message text check (char_length(coalesce(message, '')) <= 3000),
  created_at timestamptz not null default now()
);

-- ───────── Releases and deliveries ─────────
-- One per account owner whose death has been reported.
create table if not exists public.release_cases (
  owner_id uuid primary key references auth.users (id) on delete cascade,
  status text not null default 'hold' check (status in ('hold','released','cancelled')),
  reported_by text,
  evidence text,
  started_at timestamptz not null default now(),
  hold_until timestamptz not null,
  released_at timestamptz,
  updated_at timestamptz not null default now()
);

-- One per keepsake per recipient. The token is the private link sent to the recipient.
create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  keepsake_id uuid not null references public.keepsakes (id) on delete cascade,
  recipient_id uuid not null references public.recipients (id) on delete cascade,
  token text not null unique,
  scheduled_for date not null default current_date,
  status text not null default 'scheduled' check (status in ('scheduled','sent','failed','cancelled')),
  sent_at timestamptz,
  opened_at timestamptz,
  expires_at timestamptz,
  error text,
  created_at timestamptz not null default now(),
  unique (keepsake_id, recipient_id)
);
create index if not exists deliveries_due on public.deliveries (status, scheduled_for);

-- Tracks the "one week to go" reminder sent to owners of time capsules.
create table if not exists public.reminders_sent (
  keepsake_id uuid primary key references public.keepsakes (id) on delete cascade,
  sent_at timestamptz not null default now()
);

-- ───────── Lock everything down ─────────
alter table public.partners enable row level security;
alter table public.partner_members enable row level security;
alter table public.partner_events enable row level security;
alter table public.payments enable row level security;
alter table public.partner_applications enable row level security;
alter table public.release_cases enable row level security;
alter table public.deliveries enable row level security;
alter table public.reminders_sent enable row level security;

drop policy if exists "anyone can apply" on public.partner_applications;
create policy "anyone can apply" on public.partner_applications
  for insert to anon, authenticated with check (true);
grant insert on public.partner_applications to anon, authenticated;
