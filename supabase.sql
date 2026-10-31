-- ============================================================
-- Lumi — Supabase setup (only needed for cross-device sync)
-- Paste this whole file into the Supabase SQL Editor and click "Run".
-- ============================================================

-- One row per family code. `data` holds the whole save (stars, best scores).
create table if not exists public.saves (
  code        text primary key,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- Lock the table down: with RLS on and NO policies, nobody can read it directly
-- with the public (anon) key. The only way in is the two functions below, which
-- each work on a single code. This stops anyone from dumping every family's data.
alter table public.saves enable row level security;

-- Load a save by its family code (returns the JSON, or null if the code is new).
create or replace function public.load_save(p_code text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select data from public.saves where code = upper(p_code);
$$;

-- Create or update a save for a family code.
create or replace function public.save_progress(p_code text, p_data jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.saves (code, data, updated_at)
  values (upper(p_code), p_data, now())
  on conflict (code) do update
    set data = excluded.data, updated_at = now();
end;
$$;

-- Allow the app (anon key) to call ONLY these two functions.
grant execute on function public.load_save(text)            to anon;
grant execute on function public.save_progress(text, jsonb) to anon;
