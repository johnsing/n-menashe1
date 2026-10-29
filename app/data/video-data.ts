// app/videos/data.ts — curated video library
// To add a video: paste its YouTube ID (the part after v= in the URL),
// title, speaker, and category. It appears in the grid automatically.

export interface Video {
  id: string;        // YouTube video id, e.g. "JHeBK-2JDz0"
  title: string;
  speaker: string;
  category: Category;
}

export type Category =
  | "Holidays"
  | "Torah & Parsha"
  | "Prayer"
  | "History"
  | "For Kids";

export const CATEGORIES: Category[] = [
  "Holidays",
  "Torah & Parsha",
  "Prayer",
  "History",
  "For Kids",
];

export const videos: Video[] = [
  {
    id: "JHeBK-2JDz0",
    title: "The Jewish Holiday of Sukkot, What is It?",
    speaker: "Jewish Learning Institute",
    category: "Holidays",
  },
  {
    id: "wVw6_c2el2M",
    title: "Sukkot: What Does This Jewish Holiday Mean?",
    speaker: "Rabbi Jason Sobel Official",
    category: "Holidays",
  },
  {
    id: "RhbCrWsft0Q",
    title: "Every Jewish Holiday, Explained",
    speaker: "People Of The Book",
    category: "Holidays",
  },
  {
    id: "6mmZDYogjCk",
    title: "What is Purim? An introduction to the Jewish holiday",
    speaker: "BimBam",
    category: "For Kids",
  },
  {
    id: "KFTCzL-j_Tk",
    title: "PARASHAT LEKH LEKHA Nangma nahina tah'a hinkho naman khah hitam?",
    speaker: "HaRav Yadiel Hatlei",
    category: "Torah & Parsha",
  }
];
