// Tanakh books with the Sefaria reference names used by the reader.

export interface Book {
  slug: string;
  name: string;
  /** Sefaria API book name, e.g. "I Samuel". */
  sefaria: string;
  chapters: number;
  section: "Torah" | "Nevi'im" | "Ketuvim";
}

export const BOOKS: Book[] = [
  // Torah
  { slug: "genesis",      name: "Bereshit",      sefaria: "Genesis",      chapters: 50, section: "Torah" },
  { slug: "exodus",       name: "Shemot",       sefaria: "Exodus",       chapters: 40, section: "Torah" },
  { slug: "leviticus",    name: "Vayikra",    sefaria: "Leviticus",    chapters: 27, section: "Torah" },
  { slug: "numbers",      name: "Bamidbar",      sefaria: "Numbers",      chapters: 36, section: "Torah" },
  { slug: "deuteronomy",  name: "Devarim",  sefaria: "Deuteronomy",  chapters: 34, section: "Torah" },
  // Nevi'im
  { slug: "joshua",       name: "Yehoshua",       sefaria: "Joshua",       chapters: 24, section: "Nevi'im" },
  { slug: "judges",       name: "Shoftim",       sefaria: "Judges",       chapters: 21, section: "Nevi'im" },
  { slug: "i-samuel",     name: "I Samuel",     sefaria: "I Samuel",     chapters: 31, section: "Nevi'im" },
  { slug: "ii-samuel",    name: "II Samuel",    sefaria: "II Samuel",    chapters: 24, section: "Nevi'im" },
  { slug: "i-kings",      name: "I Melachim",      sefaria: "I Kings",      chapters: 22, section: "Nevi'im" },
  { slug: "ii-kings",     name: "II Melachim",     sefaria: "II Kings",     chapters: 25, section: "Nevi'im" },
  { slug: "isaiah",       name: "Yeshayahu",       sefaria: "Isaiah",       chapters: 66, section: "Nevi'im" },
  { slug: "jeremiah",     name: "Yirmiyahu",     sefaria: "Jeremiah",     chapters: 52, section: "Nevi'im" },
  { slug: "ezekiel",      name: "Yechezkel",      sefaria: "Ezekiel",      chapters: 48, section: "Nevi'im" },
  { slug: "hosea",        name: "Hoshea",        sefaria: "Hosea",        chapters: 14, section: "Nevi'im" },
  { slug: "joel",         name: "Yoel",         sefaria: "Joel",         chapters: 4,  section: "Nevi'im" },
  { slug: "amos",         name: "Amos",         sefaria: "Amos",         chapters: 9,  section: "Nevi'im" },
  { slug: "obadiah",      name: "Avdiah",      sefaria: "Obadiah",      chapters: 1,  section: "Nevi'im" },
  { slug: "jonah",        name: "Yonah",        sefaria: "Jonah",        chapters: 4,  section: "Nevi'im" },
  { slug: "micah",        name: "Mikhah",        sefaria: "Micah",        chapters: 7,  section: "Nevi'im" },
  { slug: "nahum",        name: "Nahum",        sefaria: "Nahum",        chapters: 3,  section: "Nevi'im" },
  { slug: "habakkuk",     name: "Chavakuk",     sefaria: "Habakkuk",     chapters: 3,  section: "Nevi'im" },
  { slug: "zephaniah",    name: "Tzefaniah",    sefaria: "Zephaniah",    chapters: 3,  section: "Nevi'im" },
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

export const getBook = (slug: string) =>
  BOOKS.find((book) => book.slug === slug);

export const booksBySection = (section: Book["section"]) =>
  BOOKS.filter((book) => book.section === section);
