-- KeepNear: first database setup.
-- Run once in Supabase → SQL Editor → New query → paste → Run.

-- ───────────── Profiles ─────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  plan text not null default 'free'
    check (plan in ('free','starter','plus','family','premium','lifetime')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────── Keepsakes ─────────────
create table if not exists public.keepsakes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('video','photo','document')),
  title text not null check (char_length(title) between 1 and 120),
  note text,
  storage_path text not null unique,
  mime_type text,
  size_bytes bigint,
  duration_seconds integer,
  status text not null default 'uploading' check (status in ('uploading','ready')),
  release_on text not null default 'after_death' check (release_on in ('after_death','date')),
  release_date date,
  created_at timestamptz not null default now()
);
create index if not exists keepsakes_owner_idx on public.keepsakes (owner_id);

-- ───────────── Recipients ─────────────
create table if not exists public.recipients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null,
  email text,
  relationship text,
  created_at timestamptz not null default now()
);
create index if not exists recipients_owner_idx on public.recipients (owner_id);

create table if not exists public.keepsake_recipients (
  keepsake_id uuid not null references public.keepsakes (id) on delete cascade,
  recipient_id uuid not null references public.recipients (id) on delete cascade,
  primary key (keepsake_id, recipient_id)
);

-- ───────────── Release holder (solicitor / executor) ─────────────
create table if not exists public.release_holders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users (id) on delete cascade,
  full_name text not null,
  role text not null default 'solicitor'
    check (role in ('solicitor','will_writer','executor','other')),
  firm text,
  email text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ───────────── Row-level security: owners only ─────────────
alter table public.profiles enable row level security;
alter table public.keepsakes enable row level security;
alter table public.recipients enable row level security;
alter table public.keepsake_recipients enable row level security;
alter table public.release_holders enable row level security;

drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "own profile update name" on public.profiles;
create policy "own profile update name" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
-- The plan column is only changed by the payment system (service role), never by the user.
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;

drop policy if exists "own keepsakes" on public.keepsakes;
create policy "own keepsakes" on public.keepsakes
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "own recipients" on public.recipients;
create policy "own recipients" on public.recipients
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "own keepsake links" on public.keepsake_recipients;
create policy "own keepsake links" on public.keepsake_recipients
  for all
  using (
    exists (select 1 from public.keepsakes k where k.id = keepsake_id and k.owner_id = auth.uid())
  )
  with check (
    exists (select 1 from public.keepsakes k where k.id = keepsake_id and k.owner_id = auth.uid())
    and exists (select 1 from public.recipients r where r.id = recipient_id and r.owner_id = auth.uid())
  );

drop policy if exists "own release holder" on public.release_holders;
create policy "own release holder" on public.release_holders
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- ───────────── Private storage bucket ─────────────
-- Files live at vault/<user id>/<file>. Nothing is public; viewing uses short-lived signed links.
insert into storage.buckets (id, name, public, file_size_limit)
values ('vault', 'vault', false, 524288000) -- 500 MB per file
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

drop policy if exists "vault owner read" on storage.objects;
create policy "vault owner read" on storage.objects
  for select to authenticated
  using (bucket_id = 'vault' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "vault owner insert" on storage.objects;
create policy "vault owner insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'vault' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "vault owner delete" on storage.objects;
create policy "vault owner delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'vault' and (storage.foldername(name))[1] = auth.uid()::text);
