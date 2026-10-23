-- Run this migration once in the Supabase SQL Editor.
-- The frontend uses only the publishable/anon key; service_role is not required.
create table if not exists public.challenge_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.challenge_data enable row level security;
alter table public.challenge_data force row level security;

drop policy if exists "challenge_data_select_own" on public.challenge_data;
drop policy if exists "challenge_data_insert_own" on public.challenge_data;
drop policy if exists "challenge_data_update_own" on public.challenge_data;
drop policy if exists "challenge_data_delete_own" on public.challenge_data;

create policy "challenge_data_select_own"
  on public.challenge_data for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "challenge_data_insert_own"
  on public.challenge_data for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "challenge_data_update_own"
  on public.challenge_data for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "challenge_data_delete_own"
  on public.challenge_data for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.challenge_data to authenticated;
