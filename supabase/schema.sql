-- ============================================================
-- MANDALART — Supabase schema (run in SQL Editor, top to bottom)
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- TABLES
-- ------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  tag text not null,
  friend_code text generated always as (username || '#' || tag) stored,
  locale text not null default 'en',
  theme_pref text not null default 'mondrian',
  dark_mode boolean not null default true,
  has_seen_onboarding boolean not null default false,
  created_at timestamptz not null default now(),
  unique (username, tag)
);

create table if not exists public.mandalarts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Untitled Mandalart',
  theme text not null default 'mondrian',
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mandalart_cells (
  id uuid primary key default gen_random_uuid(),
  mandalart_id uuid not null references public.mandalarts(id) on delete cascade,
  row smallint not null check (row between 0 and 8),
  col smallint not null check (col between 0 and 8),
  content text not null default '',
  description text not null default '',
  color_tag text,
  updated_at timestamptz not null default now(),
  unique (mandalart_id, row, col)
);

create table if not exists public.mandalart_collaborators (
  mandalart_id uuid not null references public.mandalarts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'editor' check (role in ('owner', 'editor', 'viewer')),
  added_at timestamptz not null default now(),
  primary key (mandalart_id, user_id)
);

create table if not exists public.friendships (
  user_id uuid not null references public.profiles(id) on delete cascade,
  friend_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'blocked')),
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);

-- ------------------------------------------------------------
-- TRIGGERS / FUNCTIONS
-- ------------------------------------------------------------

-- Auto-create a profile row whenever someone signs up via Supabase Auth.
-- Allocates a random 4-digit tag and retries on the rare collision, the
-- same way Battle Tags / Discord-style discriminators work — usernames
-- don't have to be globally unique, the (username, tag) pair does.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
  candidate_tag text;
  attempt int := 0;
begin
  base_username := coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
  loop
    candidate_tag := lpad((floor(random() * 10000))::int::text, 4, '0');
    begin
      insert into public.profiles (id, username, tag)
      values (new.id, base_username, candidate_tag);
      exit;
    exception when unique_violation then
      attempt := attempt + 1;
      if attempt > 20 then
        raise exception 'Could not allocate a unique friend tag for %', base_username;
      end if;
    end;
  end loop;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Seed all 81 empty cells whenever a new mandalart is created.
create or replace function public.seed_mandalart_cells()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.mandalart_cells (mandalart_id, row, col)
  select new.id, r, c
  from generate_series(0, 8) r, generate_series(0, 8) c;
  return new;
end;
$$;

drop trigger if exists on_mandalart_created on public.mandalarts;
create trigger on_mandalart_created
  after insert on public.mandalarts
  for each row execute procedure public.seed_mandalart_cells();

-- Bump the parent mandalart's updated_at whenever a cell changes
-- (drives "last edited" sorting in the Manage view).
create or replace function public.touch_mandalart_updated_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.mandalarts set updated_at = now() where id = new.mandalart_id;
  return new;
end;
$$;

drop trigger if exists on_cell_changed on public.mandalart_cells;
create trigger on_cell_changed
  after insert or update on public.mandalart_cells
  for each row execute procedure public.touch_mandalart_updated_at();

-- ------------------------------------------------------------
-- ACCESS-CHECK HELPERS (kept for future use / friendships query)
-- ------------------------------------------------------------

-- Exact-match lookup only — no partial/fuzzy search, by design.

-- Exact-match lookup only — no partial/fuzzy search, by design. This is
-- what powers the "Name#0000" add-friend box: you must already know the
-- other person's full code. It's security definer so it can find a match
-- even though the tightened profiles_select policy below wouldn't
-- otherwise let two strangers see each other's rows.
create or replace function public.find_profile_by_code(code text)
returns table (id uuid, username text, tag text)
language sql
security definer
set search_path = public
as $$
  select id, username, tag
  from public.profiles
  where lower(username || '#' || tag) = lower(code)
  limit 1;
$$;

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.mandalarts enable row level security;
alter table public.mandalart_cells enable row level security;
alter table public.mandalart_collaborators enable row level security;
alter table public.friendships enable row level security;

-- profiles: you can see your own row and the rows of people you're
-- already connected with (any status — pending or accepted, either
-- direction — so you can show a name on an incoming request). Anyone
-- else is only reachable through find_profile_by_code(), which is
-- exact-match only and bypasses this policy via security definer.
drop policy if exists "profiles_select_self_and_connections" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_self_and_connections"
  on public.profiles for select
  using (
    id = auth.uid()
    or exists (
      select 1 from public.friendships f
      where (f.user_id = auth.uid() and f.friend_id = id)
         or (f.friend_id = auth.uid() and f.user_id = id)
    )
  );

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- ----------------------------------------------------------------
-- DIAGNOSTIC QUERIES — run these first if INSERT is still failing:
--
--   -- Check for unexpected triggers (besides on_mandalart_created):
--   select tgname, tgenabled, pg_get_triggerdef(oid)
--   from pg_trigger
--   where tgrelid = 'public.mandalarts'::regclass and not tgisinternal;
--
--   -- Check policy permissive/restrictive and roles columns:
--   select policyname, permissive, roles, cmd, qual, with_check
--   from pg_policies
--   where tablename = 'mandalarts';
--
-- Then run the DROP + CREATE block below to replace all policies
-- with flat, direct conditions (no helper-function indirection).
-- ----------------------------------------------------------------

-- Drop old policies first so this script is re-runnable
drop policy if exists "mandalarts_select_visible" on public.mandalarts;
drop policy if exists "mandalarts_insert_own" on public.mandalarts;
drop policy if exists "mandalarts_update_editable" on public.mandalarts;
drop policy if exists "mandalarts_delete_owner_only" on public.mandalarts;
drop policy if exists "cells_select_visible" on public.mandalart_cells;
drop policy if exists "cells_insert_editable" on public.mandalart_cells;
drop policy if exists "cells_update_editable" on public.mandalart_cells;

-- mandalarts — flat conditions, no helper functions
create policy "mandalarts_select"
  on public.mandalarts for select
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from public.mandalart_collaborators c
      where c.mandalart_id = id and c.user_id = auth.uid()
    )
    or (
      is_public = true
      and exists (
        select 1 from public.friendships f
        where f.status = 'accepted'
          and (
            (f.user_id = owner_id and f.friend_id = auth.uid())
            or (f.friend_id = owner_id and f.user_id = auth.uid())
          )
      )
    )
  );

create policy "mandalarts_insert"
  on public.mandalarts for insert
  with check (owner_id = auth.uid());

create policy "mandalarts_update"
  on public.mandalarts for update
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from public.mandalart_collaborators c
      where c.mandalart_id = id and c.user_id = auth.uid()
        and c.role in ('owner', 'editor')
    )
  );

create policy "mandalarts_delete"
  on public.mandalarts for delete
  using (owner_id = auth.uid());

-- mandalart_cells — flat subquery into mandalarts (no helper functions).
-- Note: the seed trigger (security definer) bypasses these on creation.
create policy "cells_select"
  on public.mandalart_cells for select
  using (
    exists (
      select 1 from public.mandalarts m
      where m.id = mandalart_id
        and (
          m.owner_id = auth.uid()
          or exists (
            select 1 from public.mandalart_collaborators c
            where c.mandalart_id = m.id and c.user_id = auth.uid()
          )
          or (
            m.is_public = true
            and exists (
              select 1 from public.friendships f
              where f.status = 'accepted'
                and (
                  (f.user_id = m.owner_id and f.friend_id = auth.uid())
                  or (f.friend_id = m.owner_id and f.user_id = auth.uid())
                )
            )
          )
        )
    )
  );

create policy "cells_insert"
  on public.mandalart_cells for insert
  with check (
    exists (
      select 1 from public.mandalarts m
      where m.id = mandalart_id
        and (
          m.owner_id = auth.uid()
          or exists (
            select 1 from public.mandalart_collaborators c
            where c.mandalart_id = m.id and c.user_id = auth.uid()
              and c.role in ('owner', 'editor')
          )
        )
    )
  );

create policy "cells_update"
  on public.mandalart_cells for update
  using (
    exists (
      select 1 from public.mandalarts m
      where m.id = mandalart_id
        and (
          m.owner_id = auth.uid()
          or exists (
            select 1 from public.mandalart_collaborators c
            where c.mandalart_id = m.id and c.user_id = auth.uid()
              and c.role in ('owner', 'editor')
          )
        )
    )
  );

-- mandalart_collaborators
drop policy if exists "collaborators_select" on public.mandalart_collaborators;
drop policy if exists "collaborators_insert_owner_only" on public.mandalart_collaborators;
drop policy if exists "collaborators_delete_owner_only" on public.mandalart_collaborators;
create policy "collaborators_select"
  on public.mandalart_collaborators for select
  using (
    user_id = auth.uid()
    or exists (select 1 from public.mandalarts m where m.id = mandalart_id and m.owner_id = auth.uid())
  );

create policy "collaborators_insert_owner_only"
  on public.mandalart_collaborators for insert
  with check (exists (select 1 from public.mandalarts m where m.id = mandalart_id and m.owner_id = auth.uid()));

create policy "collaborators_delete_owner_only"
  on public.mandalart_collaborators for delete
  using (exists (select 1 from public.mandalarts m where m.id = mandalart_id and m.owner_id = auth.uid()));

-- friendships
drop policy if exists "friendships_select_own" on public.friendships;
drop policy if exists "friendships_insert_request" on public.friendships;
drop policy if exists "friendships_update_respond" on public.friendships;
drop policy if exists "friendships_delete_either_side" on public.friendships;
create policy "friendships_select_own"
  on public.friendships for select
  using (auth.uid() = user_id or auth.uid() = friend_id);

create policy "friendships_insert_request"
  on public.friendships for insert
  with check (auth.uid() = user_id);

create policy "friendships_update_respond"
  on public.friendships for update
  using (auth.uid() = user_id or auth.uid() = friend_id);

create policy "friendships_delete_either_side"
  on public.friendships for delete
  using (auth.uid() = user_id or auth.uid() = friend_id);

-- ------------------------------------------------------------
-- REALTIME (needed later for collaborative editing — Phase 3)
-- ------------------------------------------------------------
-- Most Supabase projects already publish all tables. If yours doesn't,
-- run this once (skip if it errors saying the table is already a member):
-- alter publication supabase_realtime add table public.mandalart_cells;
