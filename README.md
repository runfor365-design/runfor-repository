# RUNFOR · 런포

대한민국 마라톤 대회 정보를 지도, 달력, 목록으로 연결하고 관련 뉴스와 러닝 영상을 한 페이지에서 제공하는 공개 정보 대시보드입니다.

> 이 README는 프로젝트의 개발·운영 튜토리얼입니다. 처음 프로젝트를 받는 사람도 이 문서만 읽고 로컬 실행, 데이터 교체, RSS 설정, 품질 검사, Vercel 배포와 운영 업데이트를 진행할 수 있도록 작성했습니다.

---

## 1. 프로젝트 개요

- **서비스명:** 런포(RUNFOR)
- **이름의 의미:** RUNning inFORmation과 “러너를 위해 달린다(run for)”를 함께 표현
- **목표 도메인:** `runfor.kr`
- **보조 도메인:** `run4.kr` → `runfor.kr` 리다이렉트 용도
- **서비스 목표:** 전국 마라톤 정보를 찾는 시간을 줄이고 Google AdSense 기반 공개 콘텐츠 서비스로 성장
- **운영 방식:** 회원, 로그인, 게시판, 데이터베이스 없이 정적 대회 데이터와 캐시된 RSS 사용

### 핵심 원칙

1. 대회 데이터는 Git의 JSON 파일로 관리하고 빌드 시 정적 페이지로 생성합니다.
2. 지도, 달력, 목록은 하나의 필터 상태를 공유합니다.
3. 뉴스와 YouTube 영상은 저장하지 않고 서버 API가 RSS를 조회합니다.
4. 외부 데이터의 사실 정보만 활용하고 코스 설명, 후기, 준비 팁은 직접 작성합니다.
5. 대회 신청 전 주최 측 공식 요강을 다시 확인하도록 안내합니다.
6. 뉴스 본문은 복제하지 않고 제목, 출처, 날짜, 원문 링크만 제공합니다.

---

## 2. 현재 구현 상태

### 구현 완료

- 대한민국 17개 시·도 D3/TopoJSON 인터랙티브 지도
- 지역별 대회 수에 따른 지도 색상 단계
- 지도 클릭 및 키보드 조작을 통한 지역 필터
- FullCalendar 월간 대회 달력
- 대회 일정 요약 팝업
- 반응형 대회 목록
- 키워드·지역·종목·접수 상태·개최 월 필터
- 지도·달력·목록 필터 실시간 연동
- 대회별 정적 상세 페이지(`/race/[slug]`)
- 대회별 SEO 메타데이터와 Open Graph 정보
- 직접 작성하는 코스 노트, 난이도, 준비 팁 연결
- Google 뉴스 RSS 프록시와 20분 캐시
- YouTube 채널 RSS 프록시와 30분 캐시
- 뉴스/영상 로딩, 빈 결과, 통신 실패 UI
- 서비스 소개 페이지
- 개인정보처리방침 페이지
- `sitemap.xml`, `robots.txt`, 앱 아이콘
- 모바일·태블릿·데스크톱 반응형 디자인
- 지도 키보드 접근성, 본문 건너뛰기 링크, 모션 감소 설정
- 개발용 샘플 대회 데이터 10건

### 운영 전에 남은 작업

- 샘플 대회 데이터를 실제 수집 데이터로 교체
- 실제 대회 최소 20~30건 확보
- 대회별 직접 작성 콘텐츠 확충
- 검증된 러닝 YouTube 채널 ID 등록
- 실제 운영 이메일과 개인정보처리방침 검토
- Google Search Console 및 웹 분석 도구 연결
- 콘텐츠가 충분히 쌓인 뒤 AdSense 신청
- `runfor.kr`, `run4.kr` 도메인 등록 및 연결
- 별도 관리자용 Tampermonkey 수집 스크립트 제작 또는 검증

---

## 3. 기술 스택

| 영역 | 기술 | 용도 |
| --- | --- | --- |
| 프레임워크 | Next.js 16 App Router | 정적 생성, API Route Handler, SEO |
| 언어 | TypeScript | 데이터 타입과 컴포넌트 안정성 |
| UI | React 19 | 상호작용 컴포넌트 |
| 스타일 | Tailwind CSS 4 + 전역 CSS | 빌드 파이프라인 및 프로젝트 디자인 시스템 |
| 지도 | D3.js + TopoJSON | 대한민국 시·도 지도 렌더링 |
| 달력 | FullCalendar | 월간 대회 일정 표시 |
| 아이콘 | Lucide React | 인터페이스 아이콘 |
| 데이터 | Git 내 JSON | 대회·고유 콘텐츠·채널 목록 관리 |
| 실시간 콘텐츠 | Google News RSS, YouTube RSS | 뉴스 및 영상 목록 |
| 호스팅 | Vercel 예정 | Next.js 배포 및 캐시 |

### 빌드 관련 참고

기본 `next build`의 Turbopack 빌드가 제한된 CI 환경에서 메모리를 많이 사용할 수 있어 현재 `npm run build`는 안정적인 Webpack 빌드인 `next build --webpack`을 사용합니다. Vercel에서도 정상적으로 사용할 수 있습니다.

---

## 4. 전체 데이터 흐름

```text
[관리자]
Tampermonkey 또는 수동 편집으로 대회 수집
        ↓
data/races.json 교체
        ↓
data/race-extra.json에 직접 작성 콘텐츠 유지·추가
        ↓
Git commit / push
        ↓
[Vercel]
변경 감지 → Next.js 빌드 → 대회 상세 페이지 정적 생성
        ↓
[방문자]
정적 대시보드와 상세 페이지 열람
        ├─ /api/news → Google 뉴스 RSS 조회 및 캐시
        └─ /api/youtube → 등록된 채널 RSS 조회 및 캐시
```

- `races.json`은 재수집할 때 교체할 수 있는 사실 데이터입니다.
- `race-extra.json`은 직접 작성한 콘텐츠이므로 원본 데이터를 교체해도 보존합니다.
- 두 파일은 고유한 `slug` 값으로 연결됩니다.
- 뉴스와 YouTube 데이터는 저장하지 않습니다.

---

## 5. 폴더 구조

```text
runfor/
├─ app/
│  ├─ api/
│  │  ├─ news/route.ts          # Google 뉴스 RSS 프록시
│  │  └─ youtube/route.ts       # YouTube 채널 RSS 프록시
│  ├─ race/[slug]/page.tsx      # 대회 상세 정적 페이지
│  ├─ about/page.tsx            # 서비스 소개
│  ├─ privacy/page.tsx          # 개인정보처리방침
│  ├─ globals.css               # 전체 디자인·반응형 스타일
│  ├─ icon.svg                  # 사이트 아이콘
│  ├─ layout.tsx                # 공통 레이아웃·메타데이터
│  ├─ page.tsx                  # 메인 페이지
│  ├─ robots.ts                 # robots.txt 생성
│  └─ sitemap.ts                # sitemap.xml 생성
├─ components/
│  ├─ DashboardClient.tsx       # 필터 상태와 전체 대시보드 연동
│  ├─ FilterBar.tsx             # 검색 및 필터
│  ├─ KoreaMap.tsx              # D3 대한민국 지도
│  ├─ RaceCalendar.tsx          # FullCalendar
│  ├─ RaceList.tsx              # 대회 목록
│  ├─ NewsSection.tsx           # 뉴스 UI
│  ├─ VideoSection.tsx          # 영상 UI
│  ├─ Header.tsx
│  └─ Footer.tsx
├─ data/
│  ├─ races.json                # 대회 사실 데이터
│  ├─ race-extra.json           # 직접 작성 콘텐츠
│  └─ youtube-channels.json     # YouTube 채널 목록
├─ lib/
│  ├─ races.ts                  # JSON 로드·결합·정렬
│  ├─ region-map.ts             # 지역명 표준화
│  └─ date.ts                   # 날짜·접수 상태 정규화
├─ public/geo/
│  └─ korea-sido.topojson       # 시·도 지도 경계
├─ types/race.ts                # TypeScript 데이터 타입
├─ ecosystem.config.cjs         # 샌드박스 PM2 실행 설정
├─ next.config.ts
├─ package.json
└─ tsconfig.json
```

---

## 6. 페이지와 API 경로

| 경로 | 유형 | 설명 |
| --- | --- | --- |
| `/` | 정적 페이지 | 지도·달력·목록·뉴스·영상 대시보드 |
| `/race/[slug]` | 정적 생성 | 개별 대회 상세 페이지 |
| `/about` | 정적 페이지 | 런포 소개 |
| `/privacy` | 정적 페이지 | 개인정보처리방침 |
| `/api/news` | 캐시 API | Google 뉴스 RSS 정제 JSON |
| `/api/youtube` | 캐시 API | YouTube RSS 정제 JSON |
| `/sitemap.xml` | 자동 생성 | 검색엔진 사이트맵 |
| `/robots.txt` | 자동 생성 | 검색엔진 크롤링 정책 |
| `/icon.svg` | 정적 파일 | 브라우저 아이콘 |

### API 응답 구조

뉴스와 YouTube API는 아래 형태의 JSON을 반환합니다.

```json
{
  "items": [
    {
      "title": "콘텐츠 제목",
      "link": "https://external.example.com/content",
      "publishedAt": "2026-07-17T00:00:00.000Z",
      "source": "출처 또는 채널명",
      "thumbnail": "YouTube에서만 선택적으로 사용"
    }
  ]
}
```

RSS 서버가 응답하지 않아도 메인 페이지 전체가 실패하지 않으며 빈 상태 UI를 표시합니다.

---

## 7. 로컬 개발 튜토리얼

### 7.1 요구 환경

- Node.js 20 이상 권장
- npm 10 이상 권장
- Git
- 최신 Chrome, Edge, Safari 또는 Firefox

현재 개발 검증 환경은 Node.js 22입니다.

### 7.2 설치

```bash
git clone <저장소-주소>
cd <프로젝트-폴더>
npm install
```

### 7.3 개발 서버 실행

```bash
npm run dev
```

브라우저에서 다음 주소를 엽니다.

```text
http://localhost:3000
```

다른 프로그램이 3000 포트를 사용하고 있다면 해당 프로그램을 종료하거나 다음과 같이 다른 포트를 지정합니다.

```bash
npm run dev -- -p 3001
```

### 7.4 코드 품질 검사

```bash
npm run lint
```

### 7.5 프로덕션 빌드 검사

```bash
npm run build
```

성공하면 `/`, 소개·정책 페이지, API, 모든 대회 상세 페이지가 빌드 결과에 표시됩니다.

### 7.6 프로덕션 모드 로컬 실행

```bash
npm start
```

`npm start`는 먼저 `npm run build`가 성공한 상태에서 실행해야 합니다.

### 7.7 샌드박스에서 PM2로 실행할 때

이 저장소에 포함된 `ecosystem.config.cjs`는 현재 샌드박스 경로용입니다.

```bash
npm run build
pm2 start ecosystem.config.cjs
pm2 logs runfor --nostream
```

일반 PC의 로컬 개발에는 PM2가 필요하지 않으며 `npm run dev`를 사용하면 됩니다.

---

## 8. 환경 변수

현재 필수 비밀키는 없습니다. 운영 환경에서는 사이트 기준 URL을 설정합니다.

```env
NEXT_PUBLIC_SITE_URL=https://runfor.kr
```

로컬에서 테스트하려면 프로젝트 루트에 `.env.local`을 만들 수 있습니다.

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`.env.local`은 Git에 커밋하지 않습니다.

사이트 URL을 설정하지 않으면 메타데이터와 사이트맵에서 `https://runfor.kr`를 기본값으로 사용합니다.

---

## 9. 대회 데이터 관리 튜토리얼

### 9.1 대회 원본 데이터

파일 위치:

```text
data/races.json
```

각 대회는 다음 구조를 사용합니다.

```json
{
  "대회명": "2026 전마협 청주 무료 초청 훈련 마라톤",
  "날짜": "8월 1일 (토)",
  "종목": ["10km"],
  "지역": "전국마라톤협회",
  "장소": "청주 무심천 롤러스케이트장",
  "집결시간": "오전 6시 30분",
  "접수상태": "접수중",
  "접수기간": "2026.06.17 ~ 2026.07.24",
  "설명원문": "충북 | 청주 무심천 롤러스케이트장 | 오전 6시 30분 집결 | 2026",
  "상세링크": "https://official.example.com/race",
  "slug": "2026-cheongju-training-marathon",
  "신청링크": "https://official.example.com/apply",
  "날짜_정확": "2026-08-01",
  "장소상세": "충북 청주시 무심천 롤러스케이트장",
  "집결정보": "오전 6시 30분 집결",
  "문의이메일": "contact@example.com",
  "문의전화": "000-0000-0000",
  "소개내용": "대회 소개 내용",
  "이미지": "https://example.com/race.webp"
}
```

### 9.2 필수 필드

| 필드 | 규칙 |
| --- | --- |
| `대회명` | 화면과 SEO 제목에 사용 |
| `날짜` | 사용자 표시용 날짜 |
| `종목` | 문자열 배열, 예: `풀`, `하프`, `10km`, `5km` |
| `지역` | 주최 측 또는 표시용 지역 정보 |
| `장소` | 목록에 표시할 간단한 장소 |
| `집결시간` | 목록에 표시할 시간 |
| `접수상태` | `접수중`, `접수예정`, `접수마감` 권장 |
| `접수기간` | 접수 시작·종료 기간 |
| `설명원문` | 첫 번째 `|` 앞의 값이 지도 지역 정규화에 사용됨 |
| `상세링크` | 외부 대회 정보 링크 |
| `slug` | 영문·숫자·하이픈으로 구성된 고유 URL 키 |

### 9.3 선택 필드

- `신청링크`: 공식 신청 페이지
- `날짜_정확`: `YYYY-MM-DD` 형식, 입력을 강력히 권장
- `장소상세`: 상세 페이지의 전체 주소
- `집결정보`: 상세 집결 안내
- `문의이메일`, `문의전화`: 주최 측 문의처
- `소개내용`: 대회 소개
- `이미지`: 향후 상세 페이지 이미지 기능 확장용

### 9.4 slug 규칙

`slug`는 대회마다 반드시 유일해야 합니다.

권장 형식:

```text
연도-영문지역-영문대회명
```

예시:

```text
2026-seoul-autumn-marathon
2026-jeju-oreum-trail
```

이미 배포한 대회의 slug를 바꾸면 기존 검색 링크가 404가 되므로 가능하면 유지합니다.

### 9.5 날짜 정규화

1. `날짜_정확`이 `YYYY-MM-DD` 형식이면 해당 값을 우선 사용합니다.
2. 없으면 `날짜`에서 월·일을, `설명원문`에서 연도를 추출합니다.
3. 안정적인 달력 표시와 정렬을 위해 `날짜_정확`을 항상 넣는 것이 좋습니다.

### 9.6 지도 지역 정규화

지도 지역은 `지역` 필드가 아니라 `설명원문.split('|')[0]`을 사용합니다.

예시:

```text
충북 | 청주 무심천 ... → 충청북도
경북 | 경주 ...         → 경상북도
서울 | 여의도 ...       → 서울특별시
강원특별자치도 | ...    → 강원도 지도 경계
```

별칭은 `lib/region-map.ts`에서 관리합니다. 새로운 표기가 들어오면 `aliases` 객체에 추가합니다.

### 9.7 실제 JSON으로 교체하는 순서

1. 현재 파일을 백업합니다.
2. 수집한 배열의 JSON 문법을 검사합니다.
3. 모든 항목에 중복되지 않는 `slug`가 있는지 확인합니다.
4. 모든 항목에 `날짜_정확`을 추가합니다.
5. `설명원문` 첫 구간이 지역 별칭과 매칭되는지 확인합니다.
6. `data/races.json`을 새 파일로 교체합니다.
7. 아래 명령을 실행합니다.

```bash
npm run lint
npm run build
```

8. 생성된 `/race/[slug]` 경로 수와 오류를 확인합니다.
9. 실제 신청 링크를 브라우저에서 확인합니다.
10. Git에 커밋하고 Vercel Preview를 검토한 후 운영 배포합니다.

### 9.8 샘플 데이터 주의

현재 포함된 10건은 UI 개발용 샘플입니다. `example.com` 링크가 들어간 항목은 상세 페이지에서 신청 버튼이 비활성화됩니다. 운영 전 반드시 실제 정보로 교체해야 합니다.

---

## 10. 직접 작성 콘텐츠 관리

파일 위치:

```text
data/race-extra.json
```

구조:

```json
{
  "slug": "2026-cheongju-training-marathon",
  "코스설명": "무심천 산책로 중심의 평탄한 왕복 코스입니다.",
  "난이도": "쉬움",
  "후기": "직접 참가하거나 확인한 후기",
  "팁": "여름철 체온 관리와 급수 계획이 중요합니다.",
  "추천여부": true
}
```

### 운영 원칙

- `slug`는 `races.json`의 대회와 정확히 같아야 합니다.
- 원본 대회 데이터를 다시 수집해도 이 파일은 덮어쓰지 않습니다.
- 다른 사이트의 소개 문장을 그대로 복사하지 않습니다.
- 코스 특징, 난이도 판단 근거, 교통, 주차, 날씨, 준비물처럼 러너에게 실제로 유용한 내용을 직접 작성합니다.
- 확인하지 않은 경험을 직접 참가 후기처럼 표현하지 않습니다.

`race-extra.json`에 항목이 없어도 상세 페이지는 정상 생성되며 “작성 중” 상태를 표시합니다.

---

## 11. Tampermonkey 데이터 수집 운영안

Tampermonkey 스크립트는 방문자 기능이 아니라 관리자 전용 데이터 수집 도구입니다. 현재 이 저장소에는 수집 스크립트가 포함되어 있지 않으며 별도 제작·검증해야 합니다.

### 목표 동작

1. 마라톤 목록 페이지를 인식합니다.
2. 화면에 `목록만 추출`, `상세까지 추출` 버튼을 표시합니다.
3. 카드에서 대회 기본 정보를 추출합니다.
4. 필요하면 각 상세 페이지에서 추가 정보를 추출합니다.
5. slug 기준으로 데스크톱·모바일 중복 카드를 제거합니다.
6. 결과를 JSON, CSV 또는 클립보드 형태로 내보냅니다.
7. 생성한 JSON을 `data/races.json`에 반영합니다.

### 기본 추출 필드

- 대회명
- 날짜
- 종목
- 지역
- 장소
- 집결시간
- 접수상태
- 접수기간
- 설명원문
- 상세링크
- slug

### 상세 추출 필드

- 신청링크
- 날짜_정확
- 장소상세
- 집결정보
- 문의이메일
- 문의전화
- 소개내용
- 이미지

### 구현 시 주의

- 대상 사이트가 React SPA이면 DOM 생성 후 버튼을 붙이도록 폴링 또는 MutationObserver를 사용합니다.
- 상세 페이지 파싱은 숨겨진 iframe 또는 `GM_xmlhttpRequest` 방식을 검토합니다.
- 클래스명만 믿지 말고 링크, 텍스트, 이미지 `alt` 등 여러 기준을 함께 사용합니다.
- 대상 사이트의 이용약관, robots 정책, 저작권, 서버 부하를 확인합니다.
- 빠른 병렬 요청을 피하고 요청 간격과 재시도 제한을 둡니다.
- 사실 정보 수집 범위를 넘는 본문·사진의 무단 복제를 피합니다.

---

## 12. YouTube RSS 설정

파일 위치:

```text
data/youtube-channels.json
```

기본 구조:

```json
[
  {
    "name": "표시할 채널명",
    "id": "UC로 시작하는 채널 ID"
  }
]
```

현재 ID가 빈 placeholder이므로 메인 화면에는 준비 중 안내가 표시됩니다.

### 채널 ID 찾기

1. YouTube 채널 페이지를 엽니다.
2. 채널 정보 또는 페이지 소스에서 `channel_id`를 확인합니다.
3. `UC`로 시작하는 실제 채널 ID를 복사합니다.
4. `data/youtube-channels.json`에 등록합니다.

채널 RSS 주소는 다음과 같습니다.

```text
https://www.youtube.com/feeds/videos.xml?channel_id={채널ID}
```

브라우저에서 해당 주소를 열어 XML이 정상적으로 표시되는지 확인합니다.

### 여러 채널 등록

```json
[
  { "name": "러닝 채널 A", "id": "UCxxxxxxxxxxxxxxxxxxxxxx" },
  { "name": "마라톤 채널 B", "id": "UCyyyyyyyyyyyyyyyyyyyyyy" }
]
```

API는 채널 RSS를 병렬로 불러오고 채널별 최근 항목을 합친 뒤 최신순으로 정렬합니다. 전체 응답은 최대 8개입니다.

### YouTube API로 확장할 때

키워드 검색이 꼭 필요하면 YouTube Data API v3를 추가할 수 있습니다. 이 경우:

- API 키를 브라우저 코드에 넣지 않습니다.
- Vercel 환경 변수에 비밀키를 저장합니다.
- 서버 Route Handler에서만 API를 호출합니다.
- 검색 API의 일일 할당량 비용을 확인합니다.

---

## 13. 뉴스 RSS 설정

뉴스 API 위치:

```text
app/api/news/route.ts
```

현재 Google 뉴스에서 다음 검색어를 사용합니다.

```text
마라톤 OR 러닝 대회 when:7d
```

검색어를 바꾸려면 `query` 값을 수정합니다.

예시:

```ts
const query = encodeURIComponent('마라톤 OR 울트라마라톤 OR 트레일러닝 when:7d')
```

### 캐시 시간 변경

현재 20분입니다.

```ts
export const revalidate = 1200
```

- 10분: `600`
- 20분: `1200`
- 30분: `1800`

외부 호출량과 뉴스 최신성 사이의 균형을 고려합니다.

### 저작권 원칙

- 뉴스 제목, 언론사, 게시일, 링크만 표시합니다.
- 기사 본문과 이미지를 복제하지 않습니다.
- 클릭하면 원문 언론사 페이지를 새 탭으로 엽니다.
- RSS 제공 정책이 바뀌면 즉시 연동 방식을 검토합니다.

---

## 14. 지도 관리

지도 파일:

```text
public/geo/korea-sido.topojson
```

사용 데이터는 `southkorea/southkorea-maps`의 KOSTAT 2018 단순화 시·도 TopoJSON입니다.

지도는 다음 순서로 동작합니다.

1. 클라이언트가 TopoJSON을 fetch합니다.
2. `topojson-client`가 GeoJSON FeatureCollection으로 변환합니다.
3. D3 `geoMercator`가 화면 크기에 맞게 투영합니다.
4. 필터된 대회 수를 지역별로 집계합니다.
5. 대회가 많을수록 진한 오렌지색을 적용합니다.
6. 지역 클릭 시 상위 대시보드의 지역 상태를 변경합니다.
7. 달력과 목록이 같은 필터 결과로 다시 렌더링됩니다.

### 행정구역 명칭 주의

지도 원본은 2018년 경계를 사용하므로 `강원도`, `전라북도` 명칭이 포함됩니다. 사용자 데이터의 `강원특별자치도`, `전북특별자치도`는 현재 지도 경계 명칭으로 정규화합니다.

최신 경계 데이터로 교체할 때는 다음을 확인합니다.

- TopoJSON `objects` 안에 시·도 GeometryCollection이 존재하는지
- 각 geometry의 `properties.name`에 한국어 시·도명이 있는지
- 17개 시·도가 모두 포함되는지
- 상업 서비스에서 사용할 수 있는 라이선스인지
- `lib/region-map.ts` 별칭과 이름이 일치하는지

---

## 15. 디자인과 컴포넌트 수정

### 주요 디자인 토큰

`app/globals.css`의 `:root`에서 관리합니다.

```css
:root {
  --ink: #132a39;
  --muted: #70808a;
  --paper: #f4f6f5;
  --orange: #ff5b35;
  --mint: #9bcbbd;
  --navy: #132b3a;
}
```

- `--orange`: 주요 액션, 접수중, 러닝 에너지
- `--navy`, `--ink`: 브랜드, 텍스트, 중요 패널
- `--mint`: 접수예정 및 보조 데이터
- `--paper`: 전체 배경

### 컴포넌트별 수정 위치

| 수정하려는 내용 | 파일 |
| --- | --- |
| 상단 메뉴·로고 | `components/Header.tsx` |
| 메인 카피·통계 | `components/DashboardClient.tsx` |
| 검색 필터 | `components/FilterBar.tsx` |
| 지도 색상·툴팁 | `components/KoreaMap.tsx` |
| 달력 옵션 | `components/RaceCalendar.tsx` |
| 대회 행 디자인 | `components/RaceList.tsx` |
| 상세 페이지 구성 | `app/race/[slug]/page.tsx` |
| 전체 스타일·반응형 | `app/globals.css` |

### 반응형 기준

- 1050px 이하: 중간 화면 최적화
- 820px 이하: 태블릿·모바일 레이아웃 전환
- 560px 이하: 소형 모바일 최적화

수정 후 최소한 1440px, 1024px, 768px, 390px 화면에서 확인합니다.

---

## 16. SEO 운영 튜토리얼

### 현재 적용 사항

- 공통 title과 description
- 대회별 title과 description
- 대회별 Open Graph 정보
- `generateStaticParams` 기반 상세 페이지 정적 생성
- 자동 사이트맵
- robots 정책
- 시맨틱 HTML
- 고유 상세 URL
- 소개 및 정책 페이지

### 운영 도메인 적용

Vercel 환경 변수에 다음 값을 설정합니다.

```env
NEXT_PUBLIC_SITE_URL=https://runfor.kr
```

설정 후 다시 배포해야 사이트맵과 canonical 기준 URL에 반영됩니다.

### Google Search Console 연결

1. `runfor.kr` 속성을 추가합니다.
2. DNS TXT 레코드로 소유권을 확인합니다.
3. 아래 사이트맵을 제출합니다.

```text
https://runfor.kr/sitemap.xml
```

4. 주요 대회 상세 페이지 색인을 요청합니다.
5. 404, 중복 페이지, 모바일 사용성 문제를 정기적으로 확인합니다.

### 좋은 상세 콘텐츠 기준

단순 일정 복제만으로는 검색 품질과 AdSense 승인에 불리할 수 있습니다. 각 대회에 다음 내용을 직접 작성하는 것이 좋습니다.

- 코스 특징과 고도 변화
- 초보자 적합성
- 예상 날씨와 복장
- 교통·주차·숙박 팁
- 급수와 보급 전략
- 대회 전후 주변 러닝 코스
- 실제 확인한 변경 사항

---

## 17. AdSense 준비 튜토리얼

현재 광고 스크립트와 광고 슬롯은 아직 연결하지 않았습니다.

### 신청 전 권장 조건

- 실제 대회 정보 20~30건 이상
- 대회별 직접 작성 콘텐츠 확보
- 소개, 개인정보처리방침, 문의 방법 제공
- 샘플·빈 페이지 제거
- 깨진 링크 제거
- 모바일 화면과 Core Web Vitals 확인
- 외부 콘텐츠의 저작권 원칙 준수

### 승인 후 적용 원칙

1. AdSense 계정에서 사이트를 등록합니다.
2. 제공된 Publisher ID를 환경 변수 또는 안전한 설정으로 관리합니다.
3. 공통 레이아웃에 공식 스크립트를 한 번만 추가합니다.
4. 지도 조작이나 신청 버튼을 방해하는 위치에 광고를 두지 않습니다.
5. 광고와 콘텐츠가 혼동되지 않도록 `광고` 표시를 명확히 합니다.
6. EU/영국 등 대상 방문자가 있으면 동의 관리 플랫폼을 검토합니다.
7. 자동 광고를 켠 뒤 레이아웃 이동과 모바일 사용성을 다시 확인합니다.

개인정보처리방침은 실제 사용 분석·광고 서비스에 맞춰 법률 검토 후 수정해야 합니다.

---

## 18. Vercel 배포 튜토리얼

### 18.1 Git 저장소 준비

```bash
git add .
git commit -m "Update RUNFOR data and content"
git push origin main
```

### 18.2 Vercel 웹 화면으로 배포

1. Vercel에 로그인합니다.
2. `Add New` → `Project`를 선택합니다.
3. GitHub 저장소를 가져옵니다.
4. Framework Preset이 `Next.js`인지 확인합니다.
5. Root Directory는 저장소 루트로 둡니다.
6. Build Command는 `npm run build`를 사용합니다.
7. 환경 변수에 아래 값을 추가합니다.

```text
NEXT_PUBLIC_SITE_URL=https://runfor.kr
```

8. `Deploy`를 누릅니다.
9. 배포 후 메인, 지도, 상세 페이지, 뉴스 API, 사이트맵을 확인합니다.

### 18.3 Vercel CLI를 사용하는 경우

```bash
npm install -g vercel
vercel
```

운영 배포:

```bash
vercel --prod
```

API 토큰을 코드나 Git 저장소에 저장하지 않습니다.

### 18.4 배포 후 필수 확인 주소

```text
https://배포주소/
https://배포주소/race/2026-cheongju-training-marathon
https://배포주소/api/news
https://배포주소/api/youtube
https://배포주소/sitemap.xml
https://배포주소/robots.txt
https://배포주소/privacy
```

### 18.5 커스텀 도메인 연결

1. Vercel 프로젝트의 `Settings` → `Domains`를 엽니다.
2. `runfor.kr`를 추가합니다.
3. Vercel이 안내하는 A 또는 CNAME 레코드를 도메인 등록처 DNS에 입력합니다.
4. `www.runfor.kr` 사용 여부를 정하고 한 주소로 리다이렉트합니다.
5. `run4.kr`를 추가하고 `runfor.kr`로 영구 리다이렉트합니다.
6. SSL 인증서가 자동 발급되었는지 확인합니다.
7. 도메인 연결 후 `NEXT_PUBLIC_SITE_URL`을 운영 주소로 설정하고 다시 배포합니다.

도메인 구매 전 실제 등록 가능 여부와 상표 충돌 가능성을 확인합니다.

---

## 19. 정기 운영 절차

### 대회 데이터 업데이트

```text
1. 대회 목록 수집
2. JSON 문법·slug·날짜 검사
3. races.json 교체
4. race-extra.json 콘텐츠 추가
5. npm run lint
6. npm run build
7. 로컬 화면 확인
8. Git commit / push
9. Vercel Preview 확인
10. 운영 배포 확인
```

### 권장 업데이트 주기

- 대회 일정·접수 상태: 주 1~2회
- 마감 임박 대회: 필요 시 수시 확인
- 고유 콘텐츠: 주 2~3건 이상 추가
- YouTube 채널 목록: 월 1회 검토
- 개인정보처리방침·외부 서비스: 분기별 검토
- 깨진 외부 링크: 월 1회 검사

### 대회 취소·변경 대응

- 원본 항목을 즉시 수정합니다.
- 상세 소개에 변경 확인일을 적는 방식을 권장합니다.
- 취소 상태가 필요하면 타입과 UI를 추가한 후 사용합니다.
- 이미 검색에 노출된 상세 페이지는 가능하면 삭제보다 변경 안내를 제공합니다.

---

## 20. 테스트 체크리스트

### 자동 검사

```bash
npm run lint
npm run build
```

### 기능 검사

- [ ] 메인 페이지가 오류 없이 열린다.
- [ ] 지도 17개 시·도가 표시된다.
- [ ] 지도 지역 클릭 시 달력과 목록이 변경된다.
- [ ] 전국 보기로 필터를 해제할 수 있다.
- [ ] 키워드·지역·종목·접수·월 필터가 동작한다.
- [ ] 초기화 버튼이 모든 필터를 해제한다.
- [ ] 달력 이벤트 클릭 시 팝업이 열린다.
- [ ] 대회 목록에서 상세 페이지로 이동한다.
- [ ] 모든 slug 상세 페이지가 200 응답을 반환한다.
- [ ] 공식 링크가 새 탭에서 열린다.
- [ ] 뉴스 API가 실패해도 페이지가 유지된다.
- [ ] YouTube 채널이 없을 때 준비 중 UI가 표시된다.
- [ ] 모바일에서 가로 스크롤이 발생하지 않는다.
- [ ] 키보드로 지도 지역을 선택할 수 있다.
- [ ] 브라우저 콘솔에 오류가 없다.

### SEO 검사

- [ ] 운영 도메인 환경 변수가 설정되어 있다.
- [ ] `/sitemap.xml`이 열린다.
- [ ] `/robots.txt`가 열린다.
- [ ] 상세 페이지별 title과 description이 다르다.
- [ ] 샘플 데이터와 `example.com` 링크가 제거되었다.
- [ ] 개인정보처리방침과 문의 이메일이 실제 정보다.

---

## 21. 문제 해결

### `npm install`에서 의존성 경고가 표시될 때

먼저 현재 lock 파일 기준으로 설치합니다.

```bash
rm -rf node_modules
npm install
```

`npm audit fix --force`는 Next.js를 호환되지 않는 버전으로 변경할 수 있으므로 결과를 확인하지 않고 실행하지 않습니다.

현재 감사 결과에는 Next.js 내부 PostCSS 관련 중간 등급 경고가 있을 수 있습니다. 고위험 취약점 여부를 우선 확인하고 Next.js 공식 업데이트를 통해 해결합니다.

### 빌드가 메모리 부족으로 종료될 때

프로젝트 빌드는 이미 Webpack 모드를 사용합니다. CI 메모리를 늘리거나 다음과 같이 Node 메모리를 지정할 수 있습니다.

```bash
NODE_OPTIONS="--max-old-space-size=3072" npm run build
```

Windows PowerShell:

```powershell
$env:NODE_OPTIONS="--max-old-space-size=3072"
npm run build
```

### 지도가 표시되지 않을 때

1. `/geo/korea-sido.topojson` 주소가 200인지 확인합니다.
2. 파일이 `public/geo/`에 있는지 확인합니다.
3. 브라우저 콘솔의 JSON 파싱 오류를 확인합니다.
4. TopoJSON의 `objects`와 `properties.name` 구조를 확인합니다.

### 지도에 대회 수가 표시되지 않을 때

- `설명원문` 첫 항목의 지역명을 확인합니다.
- `lib/region-map.ts`에 별칭이 있는지 확인합니다.
- 예: `경상북도`가 아니라 새로운 약칭이 들어왔다면 aliases에 추가합니다.

### 달력에 대회가 표시되지 않을 때

- `날짜_정확`이 `YYYY-MM-DD`인지 확인합니다.
- 브라우저가 해석할 수 없는 날짜 문자열을 넣지 않습니다.
- 현재 필터가 해당 대회를 제외하고 있지 않은지 확인합니다.

### 상세 페이지가 404일 때

- URL slug와 JSON의 slug가 정확히 같은지 확인합니다.
- slug 중복 여부를 확인합니다.
- JSON 수정 후 개발 서버를 재시작하거나 다시 빌드합니다.

### 뉴스가 표시되지 않을 때

- `/api/news`를 직접 엽니다.
- Google RSS의 일시적인 제한 또는 네트워크 오류일 수 있습니다.
- 검색어 문법과 XML 구조 변경 여부를 확인합니다.
- UI는 오류 시 빈 상태를 표시하도록 구현되어 있습니다.

### YouTube가 준비 중으로 표시될 때

- `data/youtube-channels.json`의 `id`가 비어 있지 않은지 확인합니다.
- 핸들(`@channel`)이 아니라 `UC`로 시작하는 채널 ID가 필요합니다.
- RSS URL을 브라우저에서 직접 확인합니다.

### Vercel과 로컬 결과가 다를 때

- Vercel 환경 변수를 확인합니다.
- 최신 Git commit이 배포되었는지 확인합니다.
- Deployments에서 빌드 로그를 확인합니다.
- Preview와 Production 도메인을 혼동하지 않았는지 확인합니다.
- 데이터 변경 후 새 배포가 실행되었는지 확인합니다.

---

## 22. 보안과 저작권

- API 토큰을 프론트엔드 코드나 Git에 넣지 않습니다.
- 비밀키는 Vercel Environment Variables로 관리합니다.
- 외부 링크는 새 탭과 `noopener`를 사용합니다.
- 신청 링크에는 검색엔진 관계와 보안을 고려해 `nofollow noopener`를 적용합니다.
- 외부 기사 본문과 이미지를 무단 복제하지 않습니다.
- 대회 사진을 사용할 때는 직접 촬영하거나 명확한 상업 이용 허가를 받은 이미지만 사용합니다.
- 수집 대상 사이트의 이용약관과 저작권 정책을 확인합니다.
- 이메일, 전화번호 등 문의처는 공개된 대회 공식 정보인지 확인합니다.
- 개인정보를 직접 수집하는 기능을 추가하면 개인정보처리방침과 보안 구조를 다시 설계합니다.

---

## 23. 지도 데이터 출처와 라이선스

시·도 경계는 [southkorea/southkorea-maps](https://github.com/southkorea/southkorea-maps)의 다음 파일을 기반으로 합니다.

```text
kostat/2018/json/skorea-provinces-2018-topo-simple.json
```

해당 저장소의 표기 기준으로 KOSTAT 데이터는 공유와 재가공이 가능합니다. 지도 데이터를 교체할 때는 새로운 출처와 라이선스를 이 README에 함께 기록해야 합니다.

---

## 24. 개발 규칙

1. `types/race.ts`의 타입을 기준으로 데이터를 작성합니다.
2. 데이터 값을 컴포넌트에 직접 하드코딩하지 않습니다.
3. 지도·달력·필터처럼 브라우저 상태가 필요한 부분만 클라이언트 컴포넌트로 둡니다.
4. 정적 생성이 가능한 페이지는 서버 컴포넌트로 유지합니다.
5. 외부 RSS는 브라우저에서 직접 요청하지 않고 `/api/*`를 사용합니다.
6. RSS API에는 반드시 캐시 시간을 설정합니다.
7. 기능 단위로 작게 커밋합니다.
8. 변경 후 `npm run lint`와 `npm run build`를 실행합니다.
9. README와 실제 구현이 달라지면 같은 커밋에서 README도 수정합니다.
10. 사용자에게 보이는 사실 정보와 직접 작성 의견을 구분합니다.

---

## 25. 향후 확장 아이디어

- Tampermonkey 수집 스크립트와 JSON 검증 자동화
- JSON Schema 또는 Zod 기반 빌드 전 데이터 검사
- 대회 취소·일정변경 상태
- 지역과 종목 조합을 URL 검색 파라미터로 공유
- 즐겨찾기용 브라우저 로컬 저장소
- 대회별 교통·주차·날씨 정보
- 코스 고도 프로필
- 실제 후기와 편집자 추천 콘텐츠
- YouTube Data API 키워드 검색
- Search Console 색인 현황 모니터링
- AdSense 광고 슬롯 및 동의 관리
- 트래픽 증가 시 Cloudflare CDN 도입

회원, 게시판, 개인화 기능을 추가할 경우 현재의 무DB 정적 구조와 개인정보처리방침을 다시 검토해야 합니다.

---

## 26. 배포 상태와 검증 기록

- **배포 플랫폼:** Vercel 예정
- **현재 상태:** 구현 완료, 로컬 프로덕션 빌드 검증 완료
- **검증 환경:** Linux, Node.js 22
- **ESLint:** 통과
- **TypeScript:** 통과
- **Next.js 프로덕션 빌드:** 통과
- **정적·SSG 경로:** 메인, 소개, 정책, 아이콘, 사이트맵, robots, 대회 상세 10개 생성 확인
- **뉴스 API:** RSS 항목 응답 확인
- **YouTube API:** 채널 미등록 상태의 준비 중 응답 확인
- **브라우저 콘솔:** 오류 없음

---

## 27. 빠른 운영 요약

처음 설치:

```bash
npm install
npm run dev
```

배포 전 검사:

```bash
npm run lint
npm run build
```

대회 업데이트:

```text
data/races.json 교체
→ data/race-extra.json 보강
→ lint/build
→ Git commit/push
→ Vercel Preview 확인
```

운영 필수 환경 변수:

```env
NEXT_PUBLIC_SITE_URL=https://runfor.kr
```

가장 중요한 운영 원칙:

```text
사실 데이터는 정확하게,
고유 콘텐츠는 직접 작성하고,
외부 원문과 공식 신청 페이지를 존중한다.
```
