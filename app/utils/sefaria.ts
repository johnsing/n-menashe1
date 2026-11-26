const TEXT_API = "https://www.sefaria.org/api/texts/";
const CACHE_SECONDS = 86_400;

type SefariaText = string | SefariaText[];

interface SefariaTextResponse {
  he?: SefariaText;
  error?: string;
}

function flattenText(text: SefariaText): string[] {
  return Array.isArray(text) ? text.flatMap(flattenText) : [text];
}

export async function fetchSefariaVerses(
  ref: string,
): Promise<string[] | null> {
  const sefariaResponse = await fetch(
    `${TEXT_API}${encodeURIComponent(ref)}?context=0&commentary=0`,
    { next: { revalidate: CACHE_SECONDS } },
  );
  if (!sefariaResponse.ok) return null;

  const { he, error } = (await sefariaResponse.json()) as SefariaTextResponse;
  return error || !he ? null : flattenText(he);
}

const ALLOWED_TAG = /^<\/?(?:b|i|em|strong|small|sup|u)\s*>$/i;

export function sanitizeSefariaHtml(html: string): string {
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<[^>]+>/g, (tag) => (ALLOWED_TAG.test(tag) ? tag : ""));
}
