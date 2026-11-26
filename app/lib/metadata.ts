// Next inherits a layout's `openGraph` object unchanged, so without an override
// every shared link would show the home-page title and description. Pages call
// this helper to keep the document head and the social preview in sync.
import type { Metadata } from "next";

export const SITE_NAME = "N-MENASHE";

type OpenGraphLocale = "he_IL" | "en_US";

export function pageMetadata({
  title,
  description,
  locale = "he_IL",
}: {
  title: string;
  description: string;
  /** Open Graph locale; Hebrew pages use he_IL, legacy English pages en_US. */
  locale?: OpenGraphLocale;
}): Metadata {
  return {
    title,
    description,
    openGraph: {
      type: "website",
      locale,
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
    },
  };
}
