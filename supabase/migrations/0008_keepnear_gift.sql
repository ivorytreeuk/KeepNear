-- KeepNear: the KeepNear Gift and partner reward types.
-- Run once in Supabase → SQL Editor → New query → paste → Run (after 0007).

-- Each partner is either on the KeepNear Gift or on cash commission.
alter table public.partners add column if not exists reward text not null default 'gift';
alter table public.partners drop constraint if exists partners_reward_check;
alter table public.partners add constraint partners_reward_check check (reward in ('gift', 'commission'));
update public.partners set reward = 'commission' where type in ('insurer', 'financial_adviser', 'will_writer');

-- The partner's share of each payment, worked out when the payment arrives:
--   Gift partners:       20% in the client's first year, then 10% for as long as they stay.
--   Commission partners: their commission rate for 24 months, then nothing.
alter table public.payments add column if not exists share_pence integer not null default 0;
update public.payments set share_pence = round(amount_pence * 0.2) where partner_id is not null and share_pence = 0;

-- Families helped by the KeepNear Gift.
create table if not exists public.gift_awards (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partners (id) on delete set null,
  family_label text not null,            -- private: first name or initials, for our records only
  situation text,                        -- private
  pays_for text not null,                -- public category, e.g. 'Flowers'
  amount_pence integer not null check (amount_pence > 0),
  supplier_name text not null,
  supplier_details text,                 -- private: invoice reference, contact
  consent boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'paid', 'declined')),
  admin_note text,
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  paid_at timestamptz
);
alter table public.gift_awards enable row level security;
-- No public policies: everything goes through the server.
