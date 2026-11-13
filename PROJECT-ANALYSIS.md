# N-MENASHE — Project Analysis

> Generated: 2026-11-12 · Repo: `n-menashe1` · Local path: `C:\Users\tzuri\n-menashe1`

## Overview

A mobile-first Torah web app ("Heritage library & media"):

- **Zmanim Train** — daily prayer times presented as a live transit-departure board
- **Library** — the full Tanakh (39 books / 929 chapters) with a chapter reader powered by the Sefaria API
- **Parashat** — weekly Torah portion pages, read by aliyah
- **Videos** — privacy-enhanced YouTube embeds
- **Audio** — shiurim with a persistent Spotify-style player
- **Q&A** — community question feed (browser-local demo)

## Stack

- Next.js 16.4.3 (App Router, Turbopack) · React 19.3 · TypeScript (strict)
- Tailwind CSS v4 + one consolidated `app/globals.css`
- `@hebcal/core` (Hebrew dates) · Hebcal API (zmanim, shabbat) · Sefaria API (biblical text)
- `zustand` (audio player) · `lenis` (smooth scrolling) · `react-icons`

## Routes

| Route | Type | Notes |
|---|---|---|
| `/` | Static | Home / section cards |
| `/calendar` | Static | Zmanim Train board |
| `/library` | Static | Bookshelf index (redesigned 2026-11-12) |
| `/library/[book]` | SSG | Chapter list, 39 paths |
| `/library/[book]/[chapter]` | Dynamic + ISR | Sefaria text, 24h revalidate (reader redesigned 2026-11-12) |
| `/library/parashat` | Static | 54 parashiyot index (redesigned 2026-11-13) |
| `/library/parashat/[slug]` | SSG | Sefaria range reader (redesigned 2026-11-13) |
| `/videos` | Static | Curated embeds |
| `/audio` | Static | Audio library + persistent player |
| `/qa` | Static (client data) | localStorage Q&A feed |
| `/qa/[id]` | Dynamic (client data) | Question + answers |

## Health check (measured)

| Check | Result |
|---|---|
| `npm run lint` | ✅ Pass, 0 errors |
| `npm run build` | ✅ Pass — 103 pages generated |
| Production dependency audit | ✅ 0 vulnerabilities |
| Dev dependency audit | ⚠️ 7 moderate (eslint/@typescript-eslint tooling only) |
| Browser console (`/library`) | ✅ No errors |
| Lighthouse (`/library/genesis/1`) | ✅ 100 accessibility, best practices, SEO |
| Lighthouse (`/library/parashat`) | ✅ 100 accessibility, best practices, SEO |
| Lighthouse (`/library/parashat/bereshit`) | ✅ 100 accessibility, best practices, SEO |

## Strengths

- Strict TypeScript; clean lint and production build
- Hydration-safe clock/location/localStorage via `useSyncExternalStore`
- Timezone-correct date handling (`Intl.DateTimeFormat.formatToParts`)
- All books and parashiyot pre-generated; chapters ISR-cached from Sefaria
- Good route boundaries: `error.tsx`, `loading.tsx`, `not-found.tsx`
- Reduced-motion support, focus-visible styles, `aria` labels on interactive elements
- Privacy-enhanced YouTube (`youtube-nocookie.com`) embeds
- Sanitized Sefaria HTML before `dangerouslySetInnerHTML`
- Audio singleton design keeps playback alive across navigation

## Issues found (ranked)

### 1. Hebrew date can be stale / hydration mismatch
`app/components/Header/HebrewDate.tsx` computes the date in a `useState`
initializer. Statically prerendered pages freeze the build-day date in the HTML;
after midnight the client and server disagree (hydration warning + stale flash).
It also never updates if the app stays open past midnight.
**Fix:** compute in an effect or reuse the `useSyncExternalStore` clock pattern.

### 2. Dead CSS files
These are no longer imported anywhere (only `globals.css` and
`lenis/dist/lenis.css` are loaded):

- `app/zmanim-board.css`
- `app/audio/player.css`
- `app/qa/qa.css`
- `app/qa/qa-extras.css`
- `app/library/css/reader.css`

Leftovers from the "consolidate all styles into globals.css" commit.

### 3. README is out of date
- Claims bilingual Hebrew **+ English** verses; the reader fetches Hebrew only
- References files that don't exist: `app/library/data.ts`, `app/parashat/`,
  `components/library/AliyahReader`, `utils/ParashaThisWeek`
- Claims MIT, but there is no `LICENSE` file

### 4. Q&A is browser-local only
`app/qa/*` stores all questions, answers and votes in `localStorage`. Data is
never shared between users, and `/qa/[id]` server-renders a "Loading…" state
before hydration. A real community feed needs route handlers + a database.

### 5. Unused config leftovers
- `next.config.ts` defines an `i.ytimg.com` image pattern, but `next/image`
  is never used (videos are iframes)
- `components.json` (shadcn) is unused; its `@/lib/utils` alias doesn't exist

### 6. Modal accessibility
`app/qa/page.tsx`: the Ask modal closes on Escape and locks page scroll, but
has no focus trap, no initial focus, and no focus restore.

### 7. No tests / CI / LICENSE
No test script or framework. Good first candidates: `getWifiStatus`,
`formatCountdown`, `toApiDate` (pure functions). No CI workflows. No LICENSE.

### 8. Minor performance / polish
- `PlayerBar` subscribes to the whole zustand store → re-renders on every
  `timeupdate` tick; select individual slices instead
- `@hebcal/core` is bundled into the client only to format one date;
  `Intl.DateTimeFormat("en-u-ca-hebrew", …)` can do this natively
- Location ids contain spaces/diacritics (`"maalot tarshīhā"`,
  `"bet she’an"`); ASCII slugs are safer in URLs/storage
- `/library` is now a Server Component (good); `/qa` and `/qa/[id]` remain
  fully client-rendered

### 9. Security notes (low risk)
The regex sanitizer in `app/utils/sefaria.ts` uses a narrow allowlist and a
trusted source, so risk is small. A parser-based sanitizer
(`sanitize-html`/DOMPurify) is more robust if sources ever change.

### 10. Next.js 16 forward-looking note
The app uses the classic model (`export const revalidate`,
`fetch(..., { next: { revalidate } })`). This is valid while
`cacheComponents` is disabled. If Cache Components is enabled later, migrate
to `use cache` + `cacheLife`; `runtime`/`preferredRegion` are deprecated.

## Recent changes (2026-11-12–13)

- `app/library/page.tsx` redesigned as a wooden bookcase:
  vertical book spines, brass section plaques, shelf planks, hover lift,
  brass bookends, Parashat plaque. Now a static Server Component with metadata.
- `app/library/[book]/page.tsx` redesigned as an opened book:
  a leather cover colour-matched to the book's spine, gilt "Start reading"
  action, Sefaria link, parchment chapter grid with 44px+ tap targets, and a
  previous/next book pager. Remains an SSG page (39 paths).
- `app/lib/bookDesign.ts` added as the shared binding palette. Colours cycle
  with the canon order (adjacent volumes always differ); spine height and width
  still vary deterministically by slug hash. It also exports `SECTION_HEBREW`
  for the book and chapter headers.
- `app/library/[book]/[chapter]/page.tsx` redesigned as an open manuscript:
  a leather title band in the book's binding colour with a gold chapter
  medallion and reading-progress bar, a parchment leaf with right-to-left
  Hebrew verses and a bookmark ribbon, a chapter pager, and a Sefaria credit.
  Single-chapter books collapse the pager to one contents card. Stays a
  dynamic ISR route; all Sefaria fetching, sanitizing and 404 validation kept.
- `app/library/parashat/page.tsx` redesigned as the annual reading scroll:
  a walnut-and-brass title band with a "54" watermark, binding-coloured jump
  tabs for the five Chumashim, and one parchment index of all 54 portions with
  their Hebrew names, transliterations, ranges and cycle numbers. Remains a
  static Server Component with 44px+ tap targets.
- `app/library/parashat/[slug]/page.tsx` redesigned as an open Torah scroll:
  a binding-coloured leather title band with annual-cycle progress, wooden
  rollers and a parchment leaf, a cycle-number ribbon, right-to-left Hebrew
  verses with a numbered gutter, adjacent-portion pager, back-to-top link and
  Sefaria credit. Keeps the 24h ISR fetch, HTML sanitizing, 404 validation and
  all 54 SSG paths. Shared Chumash labels now live in
  `app/data/parashat-data.ts`.
- `app/globals.css`: replaced unused `.library-tabs`/`.library-tab` styles with
  the "Library bookcase" section, and added the "Book page (chapter list)",
  "Chapter reader", "Parashat index" and "Parashat reader" sections. Verified
  at 320/390/768/1280px in light and dark themes; Lighthouse 100 for
  accessibility, best practices and SEO.

## Suggested next steps

1. Fix `HebrewDate` hydration/staleness
2. Delete the 5 dead CSS files
3. Refresh README and add a LICENSE
4. Add Vitest unit tests for time logic
5. Add focus management to the Q&A modal
6. Decide on a real Q&A backend (or label it clearly as a local demo)
