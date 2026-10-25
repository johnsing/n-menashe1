// app/layout.tsx
import type { Metadata, Viewport } from "next";
import Header from "./components/Header/Header";
import TabBar from "./components/Header/TabBar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "N-MENASHE",
    template: "%s | N-MENASHE",
  },
  description: "Heritage library & media — Torah, zmanim, and community.",
};

// themeColor colors the browser UI (mobile Chrome/Safari address bar)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <div className="site-content">{children}</div>
        <TabBar />
      </body>
    </html>
  );
}
