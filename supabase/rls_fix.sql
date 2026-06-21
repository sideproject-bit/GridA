-- ============================================================
-- RLS POLICY RESET — Supabase SQL Editor에서 이 파일 전체 실행
-- 기존 정책 전부 DROP(이름 무관) 후 security definer 헬퍼 함수
-- 기반으로 재작성 → 무한 재귀 및 INSERT 403 모두 해결
-- ============================================================

-- 1. 기존 정책 전부 삭제 (이름이 달라진 잔재 포함)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'profiles','mandalarts','mandalart_cells',
        'mandalart_collaborators','friendships'
      )
  ) LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- 2. 헬퍼 함수 재작성
--    security definer → postgres 유저로 실행 (Supabase에서 BYPASSRLS 보유)
--    → 내부 SELECT가 RLS를 거치지 않아 재귀 루프 불가
create or replace function public.can_view_mandalart(target_id uuid)
returns boolean
language sql security definer set search_path = public
as $$
  select exists (
    select 1 from public.mandalarts m
    where m.id = target_id
      and (
        m.owner_id = auth.uid()
        or exists (
          select 1 from public.mandalart_collaborators c
          where c.mandalart_id = target_id and c.user_id = auth.uid()
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
$$;

create or replace function public.can_edit_mandalart(target_id uuid)
returns boolean
language sql security definer set search_path = public
as $$
  select exists (
    select 1 from public.mandalarts m
    where m.id = target_id
      and (
        m.owner_id = auth.uid()
        or exists (
          select 1 from public.mandalart_collaborators c
          where c.mandalart_id = target_id
            and c.user_id = auth.uid()
            and c.role in ('owner', 'editor')
        )
      )
  )
$$;

-- 3. 정책 재생성

-- profiles
create policy "profiles_select"
  on public.profiles for select
  using (
    id = auth.uid()
    or exists (
      select 1 from public.friendships f
      where (f.user_id = auth.uid() and f.friend_id = id)
         or (f.friend_id = auth.uid() and f.user_id = id)
    )
  );

create policy "profiles_update"
  on public.profiles for update
  using (auth.uid() = id);

-- mandalarts
create policy "mandalarts_select"
  on public.mandalarts for select
  using (public.can_view_mandalart(id));

create policy "mandalarts_insert"
  on public.mandalarts for insert
  with check (owner_id = auth.uid());

create policy "mandalarts_update"
  on public.mandalarts for update
  using (public.can_edit_mandalart(id));

create policy "mandalarts_delete"
  on public.mandalarts for delete
  using (owner_id = auth.uid());

-- mandalart_cells
create policy "cells_select"
  on public.mandalart_cells for select
  using (public.can_view_mandalart(mandalart_id));

create policy "cells_insert"
  on public.mandalart_cells for insert
  with check (public.can_edit_mandalart(mandalart_id));

create policy "cells_update"
  on public.mandalart_cells for update
  using (public.can_edit_mandalart(mandalart_id));

-- mandalart_collaborators
create policy "collaborators_select"
  on public.mandalart_collaborators for select
  using (
    user_id = auth.uid()
    or public.can_edit_mandalart(mandalart_id)
  );

create policy "collaborators_insert"
  on public.mandalart_collaborators for insert
  with check (public.can_edit_mandalart(mandalart_id));

create policy "collaborators_delete"
  on public.mandalart_collaborators for delete
  using (public.can_edit_mandalart(mandalart_id));

-- ============================================================
-- CREATE_MANDALART RPC — security definer로 INSERT RLS 우회
-- 앱이 이 함수를 호출하면 postgres 권한으로 실행되므로
-- mandalarts_insert 정책이 아예 평가되지 않음.
-- 내부에서 auth.uid()로 owner_id를 설정하므로 보안은 동일.
-- ============================================================
create or replace function public.create_mandalart(p_title text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_id  uuid;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.mandalarts (owner_id, title)
  values (v_uid, p_title)
  returning id into v_id;

  return (
    select row_to_json(m)
    from (
      select id, owner_id, title, is_public, theme, created_at, updated_at
      from public.mandalarts
      where id = v_id
    ) m
  );
end;
$$;

-- grant execute to authenticated users
grant execute on function public.create_mandalart(text) to authenticated;

-- friendships
create policy "friendships_select"
  on public.friendships for select
  using (auth.uid() = user_id or auth.uid() = friend_id);

create policy "friendships_insert"
  on public.friendships for insert
  with check (auth.uid() = user_id);

create policy "friendships_update"
  on public.friendships for update
  using (auth.uid() = user_id or auth.uid() = friend_id);

create policy "friendships_delete"
  on public.friendships for delete
  using (auth.uid() = user_id or auth.uid() = friend_id);
