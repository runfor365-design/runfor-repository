-- 관리자 "숨김" 기능: 삭제하지 않고 사이트에서만 감춘다.
-- races.json 재업로드(upsert)는 이 컬럼을 건드리지 않으므로, 숨김 상태가 유지된다.
-- 공개여부(false = 승인 대기)와는 별개 개념이다.

alter table races add column if not exists "숨김여부" boolean not null default false;

create index if not exists races_숨김여부_idx on races ("숨김여부") where "숨김여부" = true;

-- 일반 방문자(anon): 승인됐고 숨기지 않은 대회만
drop policy if exists races_public_read on races;
create policy races_public_read
  on races for select
  to anon
  using ("공개여부" = true and "숨김여부" = false);

-- Data API 접근 권한 명시 (Supabase 2026-10-30 정책 변경 대비, 기존 테이블에는 영향 없음)
grant select on public.races to anon;
grant select, insert, update, delete on public.races to authenticated;
grant select, insert, update, delete on public.races to service_role;
