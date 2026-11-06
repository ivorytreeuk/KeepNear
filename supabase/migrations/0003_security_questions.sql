-- KeepNear: security questions.
-- Run once in Supabase → SQL Editor → New query → paste → Run.
-- Answers are stored only as a one-way scrambled hash. Nobody, including KeepNear staff, can read them back.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.security_questions (
  owner_id uuid primary key references auth.users (id) on delete cascade,
  question text not null check (char_length(question) between 5 and 200),
  answer_hash text not null,
  updated_at timestamptz not null default now()
);

alter table public.security_questions enable row level security;

drop policy if exists "own question read" on public.security_questions;
create policy "own question read" on public.security_questions
  for select to authenticated using (auth.uid() = owner_id);

-- Users may see which question they chose, never the answer hash. Changes go through the functions below.
revoke all on public.security_questions from anon, authenticated;
grant select (owner_id, question, updated_at) on public.security_questions to authenticated;

create or replace function public.normalise_answer(a text)
returns text language sql immutable
as $$ select regexp_replace(lower(trim(coalesce(a, ''))), '\s+', ' ', 'g') $$;

-- Signed-in user sets or changes their own question.
create or replace function public.set_my_security_answer(p_question text, p_answer text)
returns void
language plpgsql security definer set search_path = public, extensions
as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if char_length(public.normalise_answer(p_answer)) < 2 then raise exception 'answer too short'; end if;
  insert into public.security_questions (owner_id, question, answer_hash, updated_at)
  values (auth.uid(), p_question, extensions.crypt(public.normalise_answer(p_answer), extensions.gen_salt('bf')), now())
  on conflict (owner_id) do update
    set question = excluded.question, answer_hash = excluded.answer_hash, updated_at = now();
end;
$$;
revoke all on function public.set_my_security_answer(text, text) from public, anon;
grant execute on function public.set_my_security_answer(text, text) to authenticated;

-- Used by the server during sign-up, before the user has confirmed their email.
create or replace function public.set_security_answer_for(p_user uuid, p_question text, p_answer text)
returns void
language plpgsql security definer set search_path = public, extensions
as $$
begin
  if char_length(public.normalise_answer(p_answer)) < 2 then raise exception 'answer too short'; end if;
  insert into public.security_questions (owner_id, question, answer_hash, updated_at)
  values (p_user, p_question, extensions.crypt(public.normalise_answer(p_answer), extensions.gen_salt('bf')), now())
  on conflict (owner_id) do update
    set question = excluded.question, answer_hash = excluded.answer_hash, updated_at = now();
end;
$$;
revoke all on function public.set_security_answer_for(uuid, text, text) from public, anon, authenticated;
grant execute on function public.set_security_answer_for(uuid, text, text) to service_role;

-- For KeepNear support to check a caller's identity. Returns true or false only.
create or replace function public.check_security_answer(p_user uuid, p_answer text)
returns boolean
language sql security definer set search_path = public, extensions
as $$
  select exists (
    select 1 from public.security_questions
    where owner_id = p_user
      and answer_hash = extensions.crypt(public.normalise_answer(p_answer), answer_hash)
  );
$$;
revoke all on function public.check_security_answer(uuid, text) from public, anon, authenticated;
grant execute on function public.check_security_answer(uuid, text) to service_role;
