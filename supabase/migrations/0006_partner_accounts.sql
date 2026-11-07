-- KeepNear: partner sign-up and partner references.
-- Run once in Supabase → SQL Editor → New query → paste → Run (after 0005).

-- Every partner gets a unique reference (e.g. KNP-7H3K9Q) they can sign in with.
alter table public.partners add column if not exists reference text;
alter table public.partners add column if not exists contact_name text;
-- 'signup' = registered themselves on the website, 'admin' = added by KeepNear.
alter table public.partners add column if not exists source text not null default 'admin';

update public.partners
   set reference = 'KNP-' || upper(substr(md5(random()::text || id::text), 1, 6))
 where reference is null;

create unique index if not exists partners_reference_key on public.partners (reference);
