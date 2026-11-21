# N-MENASHE

Torah, zmanim, and community — a mobile-first web app. Daily prayer times on a
live "train board," the full Tanakh in a Hebrew reader, weekly parasha pages,
shared video and audio teachings, and a browser-local Q&A demo.

## Features

- **Zmanim Train** — daily zmanim (dawn → nightfall) on an animated transit
  board: live clock, countdown pills, status indicators, and a location picker
  (Israeli cities + browser geolocation). Fridays show **candle lighting**,
  Saturdays show **havdalah**, and the weekly **parasha** appears in the header.
- **Tanakh library** — all 39 books (Torah, Nevi'im, Ketuvim). Pick a book,
  choose a chapter, and read the Hebrew text (RTL) from the free Sefaria API.
- **Parashat** — weekly Torah portion pages with an aliyah reader.
- **Videos** — a thumbnail grid of Torah and holiday lessons. Anyone can add a
  video by its YouTube ID, and the shared list is stored in Supabase. Playback
  happens on the dedicated `/watch?v=<id>` page; the grid never autoplays.
- **Audio** — shiurim with a persistent bottom player that keeps playing while
  you browse. Volume and recently played tracks are remembered in the browser.
- **Q&A (local demo)** — a question feed with detail pages, voting, and answers.
  Questions, votes, and answers are stored in `localStorage`, so they are
  per-browser and are **not** shared between visitors yet.
- **Hebrew date** — computed in the browser with `@hebcal/core`, using the
  visitor's timezone, and refreshed automatically at local midnight.
- **Pull to refresh** — on touch devices, pull down from the top of any page to
  reload it; a small indicator tracks the pull and arms at the threshold.
- Dark theme, mobile-first layout, and a floating tab bar.

## Tech stack

- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript
- Tailwind CSS v4 with CSS custom properties in `app/globals.css`
- `@hebcal/core` and the Hebcal API (Hebrew dates, zmanim, Shabbat times)
- Sefaria API (biblical text)
- Supabase (shared video library)
- zustand (audio player state) · lenis (smooth scrolling) · react-icons
- Vitest (unit tests for time and date helpers)

## Getting started

### Prerequisites

- Node.js 20.9 or newer (a current LTS release is recommended)
- npm

### Install and run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Supabase setup (video library)

The rest of the app runs without Supabase. The shared video library needs a
Supabase project:

1. Create a project at [supabase.com](https://supabase.com/).
2. Create a `videos` table with `id` (text, primary key), `title` (text),
   `speaker` (text), `category` (text — `Pasal-Ho` or `Numei-Ho`), and
   `created_at` (timestamptz, default `now()`).
3. Enable row-level security and add public `select`, `insert`, and `delete`
   policies if visitors should be able to add and remove videos. Deletion in
   the UI is guarded by a confirmation, but the policy itself is open.
4. Copy the environment example and fill in your project values:

   ```bash
   cp .env.example .env.local
   ```

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   # Older projects can use the anon key instead:
   # NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

If these values are missing, `/videos` shows a setup message and the rest of
the site still works.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |

## Data and storage

- [Hebcal](https://www.hebcal.com/) — zmanim, Shabbat times, Hebrew calendar.
- [Sefaria](https://www.sefaria.org/) — biblical text (Hebrew).
- [Supabase](https://supabase.com/) — shared videos added through `/videos`.
- [YouTube](https://www.youtube.com/) — privacy-enhanced
  (`youtube-nocookie.com`) embeds on `/watch` only.
- **Browser storage** — Q&A data, audio volume, recently played tracks, and
  player preferences. These never leave the device.
- **Audio demo tracks** — the bundled playlist uses SoundHelix sample MP3s.
  Replace the `src` values in `app/audio/tracks.ts` with real shiur URLs for
  production.

Hebcal and Sefaria are free and need no API key.

## Project structure

```
app/
  audio/        audio player state, queue, demo tracks
  components/   header, zmanim board, player bar, icons
  data/         Tanakh metadata, parasha data, local Q&A data
  lib/          Hebcal zmanim/Shabbat client
  utils/        time, countdown, and Sefaria helpers
  videos/       shared video library and Supabase store
  watch/        the `/watch?v=<id>` player route
```

## Testing

Vitest covers the pure time and date helpers:

- `app/audio/format-time.test.ts` — player clock formatting
- `app/utils/wifiStatus.test.ts` — board status and countdown labels
- `app/lib/zmanim.test.ts` — timezone-aware Hebcal date keys
- `app/data/qa-data.test.ts` — relative timestamps

```bash
npm test
```

## License

MIT — see [LICENSE](LICENSE).
