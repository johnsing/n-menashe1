// app/library/page.tsx
const torah = [
  { name: "Genesis", chapters: 50 },
  { name: "Exodus", chapters: 40 },
  { name: "Leviticus", chapters: 27 },
  { name: "Numbers", chapters: 36 },
  { name: "Deuteronomy", chapters: 34 },
];

const neviim = [
  { name: "Joshua", chapters: 24 },
  { name: "Judges", chapters: 21 },
  { name: "I Samuel", chapters: 31 },
  { name: "II Samuel", chapters: 24 },
  { name: "I Kings", chapters: 22 },
  { name: "II Kings", chapters: 25 },
  { name: "Isaiah", chapters: 66 },
  { name: "Jeremiah", chapters: 52 },
  { name: "Ezekiel", chapters: 48 },
  { name: "Hosea", chapters: 14 },
  { name: "Joel", chapters: 4 },
  { name: "Amos", chapters: 9 },
  { name: "Obadiah", chapters: 1 },
  { name: "Jonah", chapters: 4 },
  { name: "Micah", chapters: 7 },
  { name: "Nahum", chapters: 3 },
  { name: "Habakkuk", chapters: 3 },
  { name: "Zephaniah", chapters: 3 },
  { name: "Haggai", chapters: 2 },
  { name: "Zechariah", chapters: 14 },
  { name: "Malachi", chapters: 3 },
];

const ketuvim = [
  { name: "Psalms", chapters: 150 },
  { name: "Proverbs", chapters: 31 },
  { name: "Job", chapters: 42 },
  { name: "Song of Songs", chapters: 8 },
  { name: "Ruth", chapters: 4 },
  { name: "Lamentations", chapters: 5 },
  { name: "Ecclesiastes", chapters: 12 },
  { name: "Esther", chapters: 10 },
  { name: "Daniel", chapters: 12 },
  { name: "Ezra", chapters: 10 },
  { name: "Nehemiah", chapters: 13 },
  { name: "I Chronicles", chapters: 29 },
  { name: "II Chronicles", chapters: 36 },
];

const sections = [
  { title: "Torah", books: torah },
  { title: "Prophets (Nevi'im)", books: neviim },
  { title: "Writings (Ketuvim)", books: ketuvim },
];

export default function LibraryPage() {
  return (
    <main className="container">
      <header className="hero">
        <h1>Library</h1>
        <p className="muted">The books of the Tanakh</p>
      </header>

      {sections.map((section) => (
        <section key={section.title} className="book-section">
          <h2 className="section-title">{section.title}</h2>
          <div className="grid">
            {section.books.map((book) => (
              <div key={book.name} className="card book-card">
                <strong>{book.name}</strong>
                <small className="muted">
                  {book.chapters}{" "}
                  {book.chapters === 1 ? "chapter" : "chapters"}
                </small>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}