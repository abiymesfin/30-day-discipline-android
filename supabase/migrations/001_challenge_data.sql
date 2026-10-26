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

-- Enable Supabase Realtime for instant updates on other signed-in devices.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_rel pr join pg_class c on c.oid = pr.prrelid join pg_namespace n on n.oid = c.relnamespace join pg_publication p on p.oid = pr.prpubid where p.pubname = 'supabase_realtime' and n.nspname = 'public' and c.relname = 'challenge_data') then
    execute 'alter publication supabase_realtime add table public.challenge_data';
  end if;
end $$;
