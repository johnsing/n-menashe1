// app/library/data.ts — Tanakh books with Sefaria reference names

export interface Book {
  slug: string;        // URL-friendly id: "genesis", "i-samuel"
  name: string;        // Display name
  sefaria: string;     // Sefaria API ref name: "Genesis", "I Samuel"
  chapters: number;
  section: "Torah" | "Nevi'im" | "Ketuvim";
}

export const BOOKS: Book[] = [
  // Torah
  { slug: "genesis",      name: "Genesis",      sefaria: "Genesis",      chapters: 50, section: "Torah" },
  { slug: "exodus",       name: "Exodus",       sefaria: "Exodus",       chapters: 40, section: "Torah" },
  { slug: "leviticus",    name: "Leviticus",    sefaria: "Leviticus",    chapters: 27, section: "Torah" },
  { slug: "numbers",      name: "Numbers",      sefaria: "Numbers",      chapters: 36, section: "Torah" },
  { slug: "deuteronomy",  name: "Deuteronomy",  sefaria: "Deuteronomy",  chapters: 34, section: "Torah" },
  // Nevi'im
  { slug: "joshua",       name: "Joshua",       sefaria: "Joshua",       chapters: 24, section: "Nevi'im" },
  { slug: "judges",       name: "Judges",       sefaria: "Judges",       chapters: 21, section: "Nevi'im" },
  { slug: "i-samuel",     name: "I Samuel",     sefaria: "I Samuel",     chapters: 31, section: "Nevi'im" },
  { slug: "ii-samuel",    name: "II Samuel",    sefaria: "II Samuel",    chapters: 24, section: "Nevi'im" },
  { slug: "i-kings",      name: "I Kings",      sefaria: "I Kings",      chapters: 22, section: "Nevi'im" },
  { slug: "ii-kings",     name: "II Kings",     sefaria: "II Kings",     chapters: 25, section: "Nevi'im" },
  { slug: "isaiah",       name: "Isaiah",       sefaria: "Isaiah",       chapters: 66, section: "Nevi'im" },
  { slug: "jeremiah",     name: "Jeremiah",     sefaria: "Jeremiah",     chapters: 52, section: "Nevi'im" },
  { slug: "ezekiel",      name: "Ezekiel",      sefaria: "Ezekiel",      chapters: 48, section: "Nevi'im" },
  { slug: "hosea",        name: "Hosea",        sefaria: "Hosea",        chapters: 14, section: "Nevi'im" },
  { slug: "joel",         name: "Joel",         sefaria: "Joel",         chapters: 4,  section: "Nevi'im" },
  { slug: "amos",         name: "Amos",         sefaria: "Amos",         chapters: 9,  section: "Nevi'im" },
  { slug: "obadiah",      name: "Obadiah",      sefaria: "Obadiah",      chapters: 1,  section: "Nevi'im" },
  { slug: "jonah",        name: "Jonah",        sefaria: "Jonah",        chapters: 4,  section: "Nevi'im" },
  { slug: "micah",        name: "Micah",        sefaria: "Micah",        chapters: 7,  section: "Nevi'im" },
  { slug: "nahum",        name: "Nahum",        sefaria: "Nahum",        chapters: 3,  section: "Nevi'im" },
  { slug: "habakkuk",     name: "Habakkuk",     sefaria: "Habakkuk",     chapters: 3,  section: "Nevi'im" },
  { slug: "zephaniah",    name: "Zephaniah",    sefaria: "Zephaniah",    chapters: 3,  section: "Nevi'im" },
  { slug: "haggai",       name: "Haggai",       sefaria: "Haggai",       chapters: 2,  section: "Nevi'im" },
  { slug: "zechariah",    name: "Zechariah",    sefaria: "Zechariah",    chapters: 14, section: "Nevi'im" },
  { slug: "malachi",      name: "Malachi",      sefaria: "Malachi",      chapters: 3,  section: "Nevi'im" },
  // Ketuvim
  { slug: "psalms",       name: "Psalms",       sefaria: "Psalms",       chapters: 150, section: "Ketuvim" },
  { slug: "proverbs",     name: "Proverbs",     sefaria: "Proverbs",     chapters: 31,  section: "Ketuvim" },
  { slug: "job",          name: "Job",          sefaria: "Job",          chapters: 42,  section: "Ketuvim" },
  { slug: "song-of-songs", name: "Song of Songs", sefaria: "Song of Songs", chapters: 8, section: "Ketuvim" },
  { slug: "ruth",         name: "Ruth",         sefaria: "Ruth",         chapters: 4,   section: "Ketuvim" },
  { slug: "lamentations", name: "Lamentations", sefaria: "Lamentations", chapters: 5,   section: "Ketuvim" },
  { slug: "ecclesiastes", name: "Ecclesiastes", sefaria: "Ecclesiastes", chapters: 12,  section: "Ketuvim" },
  { slug: "esther",       name: "Esther",       sefaria: "Esther",       chapters: 10,  section: "Ketuvim" },
  { slug: "daniel",       name: "Daniel",       sefaria: "Daniel",       chapters: 12,  section: "Ketuvim" },
  { slug: "ezra",         name: "Ezra",         sefaria: "Ezra",         chapters: 10,  section: "Ketuvim" },
  { slug: "nehemiah",     name: "Nehemiah",     sefaria: "Nehemiah",     chapters: 13,  section: "Ketuvim" },
  { slug: "i-chronicles", name: "I Chronicles", sefaria: "I Chronicles", chapters: 29,  section: "Ketuvim" },
  { slug: "ii-chronicles", name: "II Chronicles", sefaria: "II Chronicles", chapters: 36, section: "Ketuvim" },
];

export const SECTIONS: Book["section"][] = ["Torah", "Nevi'im", "Ketuvim"];

export const getBook = (slug: string) => BOOKS.find((b) => b.slug === slug);

export const booksBySection = (section: Book["section"]) =>
  BOOKS.filter((b) => b.section === section);
