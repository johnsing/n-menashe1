import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";

import CookieConsent from "./components/CookieConsent";
import Footer from "./components/Footer";
import Header from "./components/Header/Header";
import TabBar from "./components/Header/TabBar";
import PullToRefresh from "./components/PullToRefresh";
import SkipLink from "./components/SkipLink";
import LocaleProvider from "./components/providers/LocaleProvider";
import SmoothScroll from "./components/providers/SmoothScroll";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "N-MENASHE — תורה, זמנים וקהילה",
    template: "%s | N-MENASHE",
  },
  description:
    "זמני היום, התנ״ך השלם, שיעורים וקהילה של לומדים — בית של תורה, תפילה וקהילה.",
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: "N-MENASHE",
    title: "N-MENASHE — תורה, זמנים וקהילה",
    description:
      "זמני היום, התנ״ך השלם, שיעורים וקהילה של לומדים — בית של תורה, תפילה וקהילה.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

// Runs before paint so the saved locale applies immediately, without making
// the whole app dynamic by reading cookies in the layout.
const localeBootstrap = `(function(){var m=document.cookie.match(/(?:^|; )locale=(en|he)/);if(!m)return;document.documentElement.lang=m[1];document.documentElement.dir=m[1]==="he"?"rtl":"ltr";})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={heebo.variable}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: localeBootstrap }} />
      </head>
      <body>
        <LocaleProvider initialLocale="he">
          <SkipLink />
          <SmoothScroll>
            <Header />
            <main
              id="main-content"
              className="site-content"
              tabIndex={-1}
            >
              {children}
            </main>
            <TabBar />
            <Footer />
          </SmoothScroll>
          <PullToRefresh />
          <CookieConsent />
        </LocaleProvider>
      </body>
    </html>
  );
}
