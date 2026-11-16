# N-MENASHE

Torah, zmanim, and community — a mobile-first web app. Daily prayer times as a live "train board," the full Tanakh as a bilingual reader, weekly parasha pages, curated video and audio teachings, and a community Q&A.

## Features

- **Zmanim Train** — daily zmanim (dawn → nightfall) on an animated transit-board: live clock, countdown pills, status indicators, and a location picker (Israeli cities + browser geolocation). On Fridays it shows **candle lighting**, on Saturdays **havdalah**, and the weekly **parasha** in the header.
- **Library** — all 39 books of the Tanakh (Torah, Nevi'im, Ketuvim). Click a book → see all its chapters → read any chapter with **verse-by-verse Hebrew (RTL) + English**, powered by the free Sefaria API (no key required).
- **Parashat** — weekly Torah portion pages, linked from the zmanim board.
- **Aliyah Reader** — read the parasha by aliyah.
- **Videos** — curated Torah & holiday teachings (privacy-enhanced YouTube embeds).
- **Audio** — shiurim with a persistent bottom **player bar** (keep listening while browsing).
- **Q&A** — community question feed with detail pages.
- Hebrew date in the header, computed locally via `@hebcal/core` (works offline).
- Dark theme, mobile-first with a floating tab bar.

## Tech Stack

- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript
- Tailwind CSS v4 + CSS custom properties
- `@hebcal/core` (Hebrew dates) · Hebcal API (zmanim & shabbat times) · Sefaria API (biblical text)
- zustand (audio player state) · lenis (smooth scrolling) · react-icons

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Data Sources

- [Hebcal](https://www.hebcal.com/) — zmanim, shabbat times, Hebrew calendar
- [Sefaria](https://www.sefaria.org/) — biblical text (Hebrew + English translations)

Both are free, no API key required.

## License

MIT (add a `LICENSE` file if you want others to reuse this code)