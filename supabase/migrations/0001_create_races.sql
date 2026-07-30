-- RUNFOR races 테이블: 원본 대회 데이터 + 직접 작성 콘텐츠를 하나로 통합
-- 컬럼명은 한글 유지 (README.md 28.4 참고)
-- 접수상태 관련 컬럼은 없음: 화면 상태(대회예정/대회종료)는 "날짜"를 기준으로 애플리케이션에서 계산

create extension if not exists pgcrypto;

create table if not exists races (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  "대회명" text not null,
  "날짜" date not null,
  "집결" text,
  "종목배열" text[] not null default '{}',
  "지역" text,
  "장소" text,
  "주최" text,
  "접수시작" date,
  "접수마감" date,
  "홈페이지" text,
  "이메일" text,
  "전화" text,
  "소개내용" text,
  "상세링크" text,
  "코스설명" text,
  "난이도" text,
  "후기" text,
  "팁" text,
  "추천여부" boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists races_날짜_idx on races ("날짜");
create index if not exists races_지역_idx on races ("지역");
create index if not exists races_추천여부_idx on races ("추천여부") where "추천여부" = true;

-- updated_at 자동 갱신 (sitemap lastModified에 실제 값을 쓰기 위함)
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists races_set_updated_at on races;
create trigger races_set_updated_at
  before update on races
  for each row
  execute function set_updated_at();

-- RLS: 공개 키(anon)는 읽기만 허용. 쓰기는 service_role(서버 전용, RLS 우회)로만 수행.
alter table races enable row level security;

drop policy if exists races_public_read on races;
create policy races_public_read
  on races for select
  to anon, authenticated
  using (true);
