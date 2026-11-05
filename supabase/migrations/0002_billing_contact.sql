-- KeepNear: payments and contact form.
-- Run once in Supabase → SQL Editor → New query → paste → Run.

alter table public.profiles add column if not exists stripe_customer_id text unique;
alter table public.profiles add column if not exists stripe_subscription_id text;
alter table public.profiles add column if not exists plan_interval text
  check (plan_interval in ('monthly','annual','lifetime'));

-- Contact form messages. Anyone can send one; nobody can read them through the app.
-- Read them in Supabase → Table Editor → contact_messages.
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200),
  topic text not null default 'general' check (topic in ('general','partner','support','press')),
  message text not null check (char_length(message) between 1 and 4000),
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists "anyone can send a message" on public.contact_messages;
create policy "anyone can send a message" on public.contact_messages
  for insert to anon, authenticated with check (true);

grant insert on public.contact_messages to anon, authenticated;
