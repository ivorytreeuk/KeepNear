-- KeepNear: each partner's discount code for their clients (e.g. HARPER25).
-- Run once in Supabase → SQL Editor → New query → paste → Run (after 0006).
alter table public.partners add column if not exists promo_code text;
create unique index if not exists partners_promo_code_key on public.partners (upper(promo_code));
