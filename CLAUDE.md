# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

RUNFOR (런포) — a no-login, no-database Next.js dashboard that lists Korean marathon races on a map, calendar, and list, plus proxied Google News / YouTube feeds. Race data lives in Git as JSON and is rendered as static pages at build time. Full operational tutorial (data replacement, RSS config, deployment) is in `README.md` — read it before making data or deployment changes; this file only covers what a coding agent needs to navigate the code.

## Commands

```bash
npm install
npm run dev          # http://localhost:3000
npm run lint         # eslint .
npm run build        # next build --webpack (Turbopack default is intentionally avoided, see below)
npm start            # serve the production build (run `build` first)
npm run format       # prettier --write . (no semicolons, single quotes — see .prettierrc.json)
npm run format:check # prettier --check .
```

Prettier ignores `data/*.json` (scraped race data — reformatting it churns a huge diff for no readability benefit), `next-env.d.ts` (Next-managed, do not edit), and `README.md`/`CLAUDE.md` (hand-written prose, not code).

No test suite is configured in this repo (no test script, no Jest/Vitest config).

`npm run build` forces `--webpack` instead of Next's default Turbopack build — Turbopack used too much memory in the CI/sandbox this project was built in. Keep using `--webpack` unless that constraint is confirmed gone.

## Architecture

### Data pipeline — the one thing to understand before touching data code

`data/races.json` is **raw scraped data**, not the shape the UI consumes. It currently mirrors the `marathongo.co.kr` scrape schema (Korean field names like `종목배열`, `집결`, `접수시작`/`접수마감`, `홈페이지`) and is typed as `RawRace` in `types/race.ts`. Components never see this shape directly.

`lib/races.ts`'s `getRaces()` is the only place that converts `RawRace[]` → `NormalizedRace[]` (also typed in `types/race.ts`). Key conversions:

| Raw field | Normalized field | Note |
| --- | --- | --- |
| `종목배열` | `종목` | de-duplicated via `Set` (a real dupe caused a React key-collision bug once) |
| `접수시작` + `접수마감` | `접수기간` | joined into one string |
| `홈페이지` (fallback `상세링크`) | `신청링크` | |
| `날짜` (already `YYYY-MM-DD`) | `date` | falls back to `{currentYear}-01-01` if not ISO — this fallback silently produces wrong dates, don't rely on it |
| `지역` | `region` | via `lib/region-map.ts` `normalizeRegion()`, mapped to the 17 official province names the TopoJSON boundaries use |
| `접수상태` | `status` | via `lib/date.ts` `normalizeStatus()` — folds `"품절"`/`"중단"` into `접수마감` |

### Recommended races — app/page.tsx stays static, geolocation doesn't

`components/RecommendedRaces.tsx` shows 4 races picked by `lib/recommend.ts`'s priority-with-fallback chain: `race.extra.추천여부 === true` (editorial placement, set by hand in `race-extra.json`; picked at random when there are more than needed) → same-region-as-visitor → soonest-upcoming among `접수중` races. Each tier only fills the slots the previous tier left empty, so the row never comes up short even with zero featured races (the current state — see below).

The visitor's region comes from `/api/geo`, a **separate dynamic route** (`export const dynamic = 'force-dynamic'`), not from `app/page.tsx` itself. Geolocation is per-request by nature (`@vercel/functions`'s `geolocation()` only returns real data behind Vercel's edge network — it's `null` in local dev and anywhere not deployed on Vercel), and reading it directly in `page.tsx` would force the whole homepage off static generation. Keeping it in its own route lets `RecommendedRaces` fetch it client-side (same pattern as `NewsSection`/`VideoSection`) while `/` stays a static, cacheable page.

`lib/region-map.ts`'s `guessRegionFromGeo()` maps Vercel's `city`/`countryRegion` values to the 17 provinces via a hand-built lookup table (major cities + ISO 3166-2:KR codes) — this was written without a live Vercel deployment to test against, so the exact strings Vercel sends may not all be covered yet. If recommended races never show `reason: 'nearby'` in production, check what `city`/`countryRegion` `/api/geo` is actually receiving and extend the table.

As of this session, `data/race-extra.json`'s entries don't match any of the 993 real race slugs (see below), so the `featured` tier is always empty in practice and every recommendation currently falls through to `nearby`/`closing`. Add real slugs with `노출순위` set to see the featured tier populate.

If a future re-scrape uses a different source site with different field names, **do not force `data/races.json` into the current schema** — change the mapping in `lib/races.ts`/`types/race.ts` instead. The raw data should stay as close to its source as possible for easy verification/re-import.

`data/race-extra.json` holds hand-written content (course notes, difficulty, tips) keyed by `slug`, merged into `NormalizedRace.extra` by `getRaces()`. It's designed to survive `races.json` being swapped wholesale. **Currently all 6 entries are orphaned** — none of their slugs match any of the 993 real races (they're leftover from the old sample dataset), so `race.extra` is `undefined` for every race in production right now.

### Filter state — components/DashboardClient.tsx

All filter state (`search`, `region`, `status`, `month`) lives here and is the single source of truth. Two derived race lists matter:

- `filtered` — all filters applied, including `region`. Feeds `RaceCalendar` and (via `upcoming`, which further restricts to `daysUntil(date) >= 0`) `RaceList`.
- `mapRaces` — every filter **except** `region`. Feeds `KoreaMap`. This split exists on purpose: if `KoreaMap` were given `filtered`, selecting a region would zero out every other region's count (the region filter would have already removed them before the map ever saw them), breaking the choropleth and hover tooltip for anything not currently selected.

`status` defaults to `'접수중'` (not empty/"전체") — this is a deliberate product decision, not a mistake; "초기화" also resets back to `'접수중'`, not to blank.

`view` (`'map' | 'calendar'`) toggles which panel renders inside the shared `explorer-panel` grid column; `RaceList` always renders in the other column. The `id="calendar"` anchor (used by the header nav) lives on the `explorer-panel` wrapper, not on `RaceCalendar`'s own root, because `RaceCalendar` unmounts when the map tab is active — anchoring to the wrapper keeps the link working regardless of which tab is showing.

### Static generation

`app/race/[slug]/page.tsx` uses `generateStaticParams()` to pre-render one page per race at build time (993 routes currently). `lib/races.ts` is called at build time for this, so any data or mapping bug there breaks the entire build, not just runtime.

`app/api/news/route.ts` and `app/api/youtube/route.ts` are the only places external RSS is fetched — always server-side, always with `revalidate` set (news: 1200s, youtube: 1800s). Never fetch these feeds from client components.

## Session change log

Snapshot of what a prior session did to this codebase, kept here because it isn't derivable from reading the current files alone (rationale, bugs found, things ruled out).

**Data migration (the big one).** `data/races.json` was replaced with 993 real scraped races in the `marathongo.co.kr` schema, which didn't match what `lib/races.ts`/`types/race.ts` expected at the time (old schema used `설명원문`, `날짜_정확`, array-typed `종목`, etc.) and crashed the app on every page. Fixed by adding `RawRace` → `NormalizedRace` mapping in `lib/races.ts` (see Architecture above) instead of rewriting the scraped JSON.

**Bugs found and fixed during/after that migration:**
- `normalizeStatus()` didn't treat `"품절"` (sold out) as closed — 10 races showed as open when they weren't.
- One race (`2025-pohang-steel-marathon`) had a duplicate `"5km"` in `종목배열`, causing a React duplicate-key console error in the race list; fixed by de-duping in `lib/races.ts`, not just in the render.
- `RaceCalendar`'s year-prefix stripping regex was hardcoded to `2026`; data spans 2025–2027, so non-2026 titles kept their year prefix. Generalized to `/^20\d{2}년?\s*/`.
- Several other hardcoded `2026` strings (footer copyright, header "2026 일정" label, race-detail page eyebrow) were de-hardcoded to derive from the current date or the race's own date.
- `KoreaMap` unconditionally hid text labels for the 8 metro cities (서울/부산/대구/인천/광주/대전/울산/세종) — removed that exclusion; added a small manual `labelOffsets` nudge for 경기도 specifically because its centroid nearly coincides with 서울's (tiny enclave inside a much larger province) and the labels overlapped.
- "다가오는 대회" (RaceList) used to show `races.slice(0, 8)` off the globally date-sorted list, which meant already-past races (the dataset has entries back to 2025-01-01) could outrank genuinely upcoming ones. Now filtered to `daysUntil(date) >= 0` first.

**UI/layout changes**, roughly in order:
1. Removed the `hero` section entirely (copy was stale/irrelevant); promoted the Race Explorer's `section-intro` heading to the page's `<h1>` to keep exactly one h1.
2. Merged the calendar into the Race Explorer section (map + calendar side by side), then reworked again into the current form: a **map/calendar tab toggle** on the left + a **`RaceList` card list** on the right, replacing the old wide 4-column table layout (which couldn't fit a half-width column) and the `insight-rail` sidebar (next-race card, region ranking, tip card — deleted along with its CSS, accepted as an intentional information loss).
3. Removed the 종목 (distance) filter from `FilterBar` — it used a hardcoded option list (`풀/하프/30km/…`) that didn't match the free-text `종목배열` values in the real data, so most races were unfilterable by it. Other filters (지역/접수상태/월) are all derived dynamically from the actual dataset and don't have this problem.
4. `RaceCalendar`'s `initialDate` changed from `races[0]?.date` (earliest date in the whole dataset, often in the past) to `new Date()`.
5. Consolidated the redundant "eyebrow + heading" pattern that appeared both at the section level and again inside `KoreaMap`/`RaceCalendar` — the per-panel ones were dropped in favor of a `panel-toolbar` (just the functional bits: "전국 보기" reset button, status legend) since the tab labels already say what's showing.
6. `RaceList` cards were redesigned twice: first from a table row to a stacked card, then compacted — location text moved from its own line into the same row as the status badge/D-day, and distance tags capped at 3 with a `+n` overflow indicator (some races have 5+ free-text distance entries, which was making individual cards balloon in height).
7. Added a region indicator to the `RaceList` heading (`전체` when no region selected, else the short region name) so the list's active filter is visible without looking back at the map.

**Known gaps / not yet done** (also listed in `README.md` §2): `race-extra.json` orphaned (see above), ~15 races have `지역` values that aren't in `lib/region-map.ts`'s alias list (e.g. "음성", "보성", "강릉" — city/county names instead of province abbreviations) and so don't get counted on the map, and `종목배열` free text was never normalized into standard distance buckets.

**Verification note:** this environment has no `chromium-cli`/headless browser available, so UI changes above were verified via `npm run lint && npm run build` plus structural checks against the prerendered static HTML (`.next/server/app/index.html`), not actual visual screenshots. Layout/spacing details (label offsets, card sizing) may need a real browser pass.
