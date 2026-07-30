-- 대회 등록 신청 승인 플로우: 공개여부 컬럼 + 역할별 RLS 정책 분리
-- 기존 993건은 이미 공개된 대회이므로 default true로 백필된다.
-- 신청(application) 라우트에서만 명시적으로 false로 insert한다.

alter table races add column if not exists "공개여부" boolean not null default true;

create index if not exists races_공개여부_idx on races ("공개여부");

-- 기존 정책(anon+authenticated 전체 공개)을 역할별로 분리
drop policy if exists races_public_read on races;

-- 일반 방문자(anon): 공개된 대회만
create policy races_public_read
  on races for select
  to anon
  using ("공개여부" = true);

-- 로그인한 관리자(authenticated): 승인 대기 포함 전체
drop policy if exists races_admin_read on races;
create policy races_admin_read
  on races for select
  to authenticated
  using (true);
