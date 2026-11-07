-- KeepNear: two kinds of keepsake.
--   legacy = released after death, once the release holder confirms (optionally on a later date)
--   living = delivered on a chosen date while the owner is alive (a time capsule)
-- Run once in Supabase → SQL Editor → New query → paste → Run.

alter table public.keepsakes
  add column if not exists category text not null default 'legacy'
  check (category in ('legacy', 'living'));

-- A living keepsake must always have a delivery date.
alter table public.keepsakes drop constraint if exists keepsakes_living_needs_date;
alter table public.keepsakes add constraint keepsakes_living_needs_date
  check (category <> 'living' or (release_on = 'date' and release_date is not null));
