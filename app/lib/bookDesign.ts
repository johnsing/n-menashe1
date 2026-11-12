// app/lib/bookDesign.ts — deterministic binding colours shared by the
// bookcase index and the individual book pages.
import { BOOKS, type Book } from "@/app/data/data";

export interface SpinePalette {
  bg: string;
  fg: string;
  accent: string;
}

/** Hebrew names for the three Tanakh sections. */
export const SECTION_HEBREW: Record<Book["section"], string> = {
  Torah: "תורה",
  "Nevi'im": "נביאים",
  Ketuvim: "כתובים",
};

/** Muted vintage bindings, each with a foil colour for the spine bands. */
export const SPINE_PALETTES: SpinePalette[] = [
  { bg: "linear-gradient(180deg, #2b4a63 0%, #1b3042 100%)", fg: "#ecdcae", accent: "#c9a75c" },
  { bg: "linear-gradient(180deg, #713236 0%, #4a1f23 100%)", fg: "#f2dfae", accent: "#d9b06a" },
  { bg: "linear-gradient(180deg, #33503f 0%, #203429 100%)", fg: "#ecdcae", accent: "#cbb076" },
  { bg: "linear-gradient(180deg, #7d5633 0%, #59391d 100%)", fg: "#f7ead0", accent: "#f0d9a8" },
  { bg: "linear-gradient(180deg, #2c2c31 0%, #17171a 100%)", fg: "#e7d4a0", accent: "#c9a75c" },
  { bg: "linear-gradient(180deg, #e3d8bd 0%, #cfc2a2 100%)", fg: "#3b2f1c", accent: "#8a6d3b" },
  { bg: "linear-gradient(180deg, #4d3755 0%, #36243c 100%)", fg: "#e8d5a8", accent: "#d3b273" },
  { bg: "linear-gradient(180deg, #2f4d4b 0%, #1e3331 100%)", fg: "#e9d7a7", accent: "#d0b06a" },
  { bg: "linear-gradient(180deg, #803f25 0%, #5b2a15 100%)", fg: "#f6e3b8", accent: "#ecc98c" },
  { bg: "linear-gradient(180deg, #5a5630 0%, #3e3c20 100%)", fg: "#ecdfb4", accent: "#d8c07a" },
];

/** Small deterministic hash so each binding keeps its look between builds. */
export function spineHash(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) % 1000003;
  }
  return hash;
}

export function bookPalette(slug: string): SpinePalette {
  // Colours cycle with the book's position in the Tanakh, so two adjacent
  // volumes never share a binding. (Heights and widths still vary by hash.)
  const index = BOOKS.findIndex((book) => book.slug === slug);
  const offset = 6; // keeps Genesis on the plum binding
  return SPINE_PALETTES[((index >= 0 ? index : 0) + offset) % SPINE_PALETTES.length];
}
