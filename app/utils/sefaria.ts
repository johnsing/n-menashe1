// app/utils/sefaria.ts — safe rendering of Sefaria text
// Sefaria responses contain small inline tags (<i>, <b>, <small>, footnote
// superscripts). Keep a tiny allowlist, unwrap everything else.
// Script/style blocks are removed entirely (content included).

const ALLOWED = /^<\/?(?:b|i|em|strong|small|sup|u)(?:\s[^>]*)?>$/i;

export function sanitizeSefariaHtml(html: string): string {
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<[^>]+>/g, (tag) => (ALLOWED.test(tag) ? tag : ""));
}
