# N-MENASHE

A Hebrew-first, RTL Torah community site: daily zmanim on a live departure
board, the full Tanakh in a Hebrew reader, weekly parasha pages, shared video
teachings, a browser-local Q&A space, and a bilingual contact and home page.

The template follows Israeli UX, accessibility (IS 5568 / WCAG 2.0 AA), privacy,
and formatting conventions. It is a starting point, not a legal certification:
replace the placeholder organisation details and have the legal pages reviewed
before launch.

## Features

### Hebrew-first and bilingual

- `<html lang="he" dir="rtl">` with a persisted Hebrew/English switch. The
  locale is stored in a `locale` cookie, applied before paint by a small inline
  bootstrap script, and synced across tabs by a client provider.
- Layouts use logical CSS properties (`inset-inline-*`, `margin-inline-*`,
  `padding-inline-*`, `text-align: start/end`) so they mirror automatically.
- **Heebo** is loaded with `next/font/google` and exposed as `--font-heebo`.
- The shell, home page, contact page, cookie UI, and footer are bilingual. The
  legal pages remain Hebrew-only by design. The Tanakh library, videos, Q&A, and
  zmanim board are English legacy content, explicitly marked `lang="en"` and
  `dir="ltr"` so screen readers and bidi layout stay correct.

### Accessibility

- Semantic landmarks: one `<header>`, one `<main id="main-content">`, `<nav>`,
  `<section>`, and `<footer>`.
- A "דלג לתוכן הראשי" skip link is the first focusable element.
- Visible `:focus-visible` outlines, 44px touch targets, keyboard-operable
  menus, and a focus-trapped cookie settings dialog that restores focus.
- Form labels, `aria-invalid`, `aria-describedby`, an error summary, and a live
  status region on the contact form.
- Reduced-motion support, logical reading order, and dark-mode tokens with
  contrast-checked text colours.
- A dedicated Hebrew accessibility statement at `/accessibility`.

### Privacy and legal

- Granular cookie consent with necessary, analytics, and marketing categories.
  Choices are versioned and stored in `localStorage` under
  `n-menashe-cookie-consent`; no analytics or marketing script is loaded by
  default.
- Cookie settings can be reopened from the footer at any time.
- Hebrew legal templates at `/privacy` (מדיניות פרטיות) and `/terms`
  (תנאי שימוש), plus `/accessibility` (הצהרת נגישות).

### Israeli formatting

- Phone links use `tel:+972...` and display `05X-XXXXXXX` or `0X-XXX-XXXX`.
- Currency is displayed in shekels with a leading `₪`.
- Dates are displayed as `DD/MM/YYYY`.
- Helpers live in `app/lib/format.ts` and are covered by unit tests.

### Existing site features

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
- `next/font/google` (Heebo)
- `@hebcal/core` and the Hebcal API (Hebrew dates, zmanim, Shabbat times)
- Sefaria API (biblical text)
- Supabase (shared video library)
- lenis (smooth scrolling) · react-icons
- Vitest (unit tests for time, date, and Israeli formatting helpers)

## Getting started

### Prerequisites

- Node.js 20.9 or newer (a current LTS release is recommended)
- npm

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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

## Customising the template

- **Organisation details** — edit `app/lib/site.ts` to replace the placeholder
  phone number, email addresses, address, accessibility coordinator, and
  `lastUpdated` date. The footer, contact page, and legal pages read from it.
- **Bilingual copy** — edit the `he` and `en` dictionaries in
  `app/lib/i18n.ts`. Both dictionaries are type-checked against the same keys.
- **Colours and spacing** — edit the design tokens at the top of
  `app/globals.css`. `--accent-ink` is the dark-gold text colour for light
  surfaces; `--accent` is the bright gold for dark surfaces.
- **Contact form** — `app/contact/ContactForm.tsx` validates locally and shows a
  demo success state. Connect a server action, email API, or CRM before launch.
- **Legal copy** — review `/accessibility`, `/privacy`, and `/terms` with the
  organisation's legal and accessibility advisers. The pages are templates.

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
- **Locale cookie** — `locale=he|en`, used by the pre-paint bootstrap and the
  client locale provider.
- **Cookie consent** — `n-menashe-cookie-consent` in `localStorage`. The record
  includes the schema version, analytics/marketing choices, and a timestamp.
- **Browser storage** — Q&A questions, answers, and votes. These never leave
  the device.

Hebcal and Sefaria are free and need no API key.

## Testing

Vitest covers the pure time, date, and formatting helpers:

- `app/utils/wifiStatus.test.ts` — board status and countdown labels
- `app/lib/zmanim.test.ts` — timezone-aware Hebcal date keys
- `app/data/qa-data.test.ts` — relative timestamps
- `app/lib/format.test.ts` — Israeli phone, `₪` currency, and `DD/MM/YYYY` dates

## Accessibility notes

The site targets IS 5568 / WCAG 2.0 AA: semantic structure, keyboard access,
visible focus, contrast-checked tokens, labelled forms, reduced motion, and
bilingual `lang`/`dir` handling. Automated checks (Lighthouse, axe) are useful
but do not replace a manual audit with screen readers and keyboard-only testing.
Third-party embeds (YouTube, Sefaria, Hebcal) and user-generated content remain
outside the site's direct control; the accessibility statement lists these
limitations.

## License

MIT — see [LICENSE](LICENSE).
