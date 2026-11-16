# N-MENASHE — Project Analysis

> Generated: 2026-11-12 · Repo: `n-menashe1` · Local path: `C:\Users\tzuri\n-menashe1`

## Overview

A mobile-first Torah web app ("Heritage library & media"):

- **Zmanim Train** — daily prayer times presented as a live transit-departure board
- **Library** — the full Tanakh (39 books / 929 chapters) with a chapter reader powered by the Sefaria API
- **Parashat** — weekly Torah portion pages, read by aliyah
- **Videos** — thumbnail lesson library, privacy-enhanced YouTube + AnonMP4 playback on `/watch`, plus add-by-ID in the browser
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
| `/videos` | Static | Thumbnail lesson library + local add-by-ID; playback only on `/watch` |
| `/watch?v=<id>` | Dynamic | Full-page player; YouTube uses the bare query, AnonMP4 adds `&provider=anonmp4`; invalid IDs/providers return 404 |
| `/audio` | Static | Audio library + persistent player |
| `/qa` | Static (client data) | localStorage Q&A feed |
| `/qa/[id]` | Dynamic (client data) | Question + answers |

Legacy `/videos/watch/youtube/:id` and `/videos/watch/:provider/:id` links
307-redirect to the canonical `/watch` URL.

## Health check (measured)

| Check | Result |
|---|---|
| `npm run lint` | ✅ Pass, 0 errors |
| `npm run build` | ✅ Pass — 104 pages generated |
| Production dependency audit | ✅ 0 vulnerabilities |
| Dev dependency audit | ⚠️ 7 moderate (eslint/@typescript-eslint tooling only) |
| Browser console (`/library`) | ✅ No errors |
| Lighthouse (`/library/genesis/1`) | ✅ 100 accessibility, best practices, SEO |
| Lighthouse (`/library/parashat`) | ✅ 100 accessibility, best practices, SEO |
| Lighthouse (`/library/parashat/bereshit`) | ✅ 100 accessibility, best practices, SEO |
| Lighthouse (`/calendar`) | ✅ 100 accessibility, best practices, SEO |
| Lighthouse (`/qa`) | ✅ 100 accessibility, best practices, SEO |
| Lighthouse (`/qa/[id]`) | ✅ 100 accessibility, best practices, SEO |
| Lighthouse (`/videos`) | ✅ 100 accessibility, best practices, SEO |
| Lighthouse (`/watch?v=JHeBK-2JDz0`) | ✅ 100 accessibility, best practices, SEO |

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

### 6. No tests / CI / LICENSE
No test script or framework. Good first candidates: `getWifiStatus`,
`formatCountdown`, `toApiDate` (pure functions). No CI workflows. No LICENSE.

### 7. Minor performance / polish
- `PlayerBar` subscribes to the whole zustand store → re-renders on every
  `timeupdate` tick; select individual slices instead
- `@hebcal/core` is bundled into the client only to format one date;
  `Intl.DateTimeFormat("en-u-ca-hebrew", …)` can do this natively
- Location ids contain spaces/diacritics (`"maalot tarshīhā"`,
  `"bet she’an"`); ASCII slugs are safer in URLs/storage
- `/library` is now a Server Component (good); `/qa` and `/qa/[id]` remain
  fully client-rendered

### 8. Security notes (low risk)
The regex sanitizer in `app/utils/sefaria.ts` uses a narrow allowlist and a
trusted source, so risk is small. A parser-based sanitizer
(`sanitize-html`/DOMPurify) is more robust if sources ever change.

### 9. Next.js 16 forward-looking note
The app uses the classic model (`export const revalidate`,
`fetch(..., { next: { revalidate } })`). This is valid while
`cacheComponents` is disabled. If Cache Components is enabled later, migrate
to `use cache` + `cacheLife`; `runtime`/`preferredRegion` are deprecated.

## Recent changes (2026-11-12–16)

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
- `/calendar` (Zmanim Train) rebuilt as a responsive live departure board:
  a station header with a second-by-second clock, timezone label, full date,
  next-zman time/countdown and parasha chip; a visible Location field with a
  geolocation button; a semantic `<ol>` timetable with icon rail, Hebrew name,
  countdown pill and status column; skeleton, empty and friendly error states;
  and a theme-aware `--zt-*` stylesheet with light/dark tokens. Verified at
  320/360/390/768/1024/1280/1920px and in dark mode with no horizontal
  overflow; offline fetch at 320px shows "Times unavailable" and a 44px retry
  button; Lighthouse 100 accessibility, best practices and SEO.
- `/qa` redesigned as a responsive community study-hall feed: a hero with
  live question/answer/resolved totals and an always-visible ask action; a
  search field with a clear control; wrapped topic chips and a segmented sort;
  a results summary; question cards with a vote rail, wrapped titles, tags and
  metadata; and a skeleton-free empty state with a reset action. The ask
  dialog now traps focus, restores it on close, locks background scroll and
  becomes a bottom sheet on phones, with 44px+ controls and 16px inputs to
  prevent iOS zoom. Verified from 280px through 1920px plus dark mode and
  extreme zoom with no document overflow; Lighthouse 100 accessibility, best
  practices and SEO.
- `/qa/[id]` redesigned as a readable question page: a breadcrumb, a featured
  question card with vote rail and gold accent, a larger title and excerpt,
  wrapped tags and metadata; an answers header with count and live response
  note, article-style answer cards that preserve line breaks, a friendly
  no-answers state, and a labeled answer form. View counting, voting, answer
  posting and `localStorage` persistence are unchanged. The header date wrapper
  was simplified so the date ellipsizes instead of overflowing at extreme zoom.
  Verified from 280px through 1920px, dark mode, 195px zoom and long unbroken
  content with no overflow; keyboard focus order and focus rings checked;
  Lighthouse 100 accessibility, best practices and SEO on answered and
  unanswered questions.
- `/videos` rebuilt as a responsive screening library with a featured lesson
  and a three-column teaching grid. Cards are still thumbnails, never inline
  players: YouTube uses `i.ytimg.com/vi/<id>/hqdefault.jpg` through
  `next/image`, while AnonMP4 uses a styled provider/ID fallback because it
  exposes no public thumbnail. Every poster and title links to `/watch`, the
  only page that loads a player. The hero video-count badge and all card
  iframes were removed, so no video loads or plays on `/videos`. AnonMP4
  playback uses `https://anonmp4.art/embed/<id>` (uploaded at
  `https://anonmp4.to/`); `anonmp4.to/embed/<id>` currently returns a 404
  page, and AnonMP4's one-time playback ticket/session can still fail on their
  side, in which case the watch page's external fallback remains available. The
  curated list lives in `app/videos/video-data.ts`. An **Add video** button
  opens an accessible dialog that accepts a YouTube or AnonMP4 **ID only**
  (full links are rejected with guidance), a required title and an optional
  speaker. Additions are validated, stored in `localStorage`
  (`n-menashe-videos-v1`), merged with the curated list, and can be removed
  from their tile; they persist per browser and do not change the static
  build. Verified at 320/390/768/1280px in light and dark themes with zero
  iframes, 16:9 posters, 44px controls and no horizontal overflow;
  poster/title and AnonMP4 fallback clicks open the matching `/watch` URL.
  Add/reload/duplicate/remove and focus-trap flows passed at 195px and 390px;
  Lighthouse 100 accessibility, best practices and SEO.
- The shareable player moved from `/videos/watch/[provider]/[id]` to the
  canonical `/watch?v=<id>` URL (YouTube IDs need no provider; AnonMP4 links
  add `&provider=anonmp4`). Featured and tile titles plus each 44px "Open
  video" action now use the new URL; provider watch links still open the
  source site. The old route was removed, and `next.config.ts` 307-redirects
  both legacy shapes so existing bookmarks keep working. `proxy.ts` validates
  the query before rendering, which lets invalid IDs and providers return a
  real 404 even though the page reads `searchParams`; the page repeats the
  check. Any valid ID renders on demand, so browser-local videos play from a
  direct URL even when their title was saved in another browser, using a
  generic title until local metadata resolves; a `MutationObserver` keeps the
  tab title in sync once it does. The page uses an eager, provider-aware 16:9
  iframe, shows the provider/ID, an external fallback, an AnonMP4 single-use
  ticket note, and "More teachings" cards. At 900px and up the player and
  details sit side by side so the floating tab bar cannot cover the primary
  actions. Verified at 320/390/768/1280px in light and dark themes with no
  overflow, 44px controls, local title sync and no application console errors;
  Lighthouse 100 accessibility, best practices and SEO.
- Embed permissions were trimmed to `picture-in-picture; fullscreen` in
  `app/videos/video-data.ts`. Firefox warns for each unsupported feature name
  in YouTube's stock `allow` list; the library does not use those features,
  and the trimmed list loads the embeds cleanly with no page errors.

## Suggested next steps

1. Fix `HebrewDate` hydration/staleness
2. Delete the 5 dead CSS files
3. Refresh README and add a LICENSE
4. Add Vitest unit tests for time logic
5. Decide on a real Q&A backend (or label it clearly as a local demo)
