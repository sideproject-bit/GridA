-- Run this in Supabase Dashboard → SQL Editor

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  subject text not null,
  message text not null,
  created_at timestamptz default now(),
  admin_reply text,
  replied_at timestamptz,
  status text default 'pending' check (status in ('pending', 'replied'))
);

alter table public.contact_messages enable row level security;

create policy "contact_select_own"
  on public.contact_messages for select
  using (auth.uid() = user_id);

create policy "contact_insert_own"
  on public.contact_messages for insert
  with check (auth.uid() = user_id);
