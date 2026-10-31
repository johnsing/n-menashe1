// app/qa/page.tsx — Q&A Community Demo
"use client";

import { useState } from "react";
import Link from "next/link";

interface Question {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  avatar: string;
  votes: number;
  answers: number;
  views: number;
  tags: string[];
  createdAt: string;
  isResolved: boolean;
}

const INITIAL_QUESTIONS: Question[] = [
  {
    id: "1",
    title: "How to properly format Hebrew vowel points (Nikud) in Next.js SSR?",
    excerpt: "When fetching text from APIs like Sefaria, combining marks and HTML entities sometimes shift or render out of order when server-side rendering...",
    author: "Avi Miller",
    avatar: "AM",
    votes: 14,
    answers: 3,
    views: 120,
    tags: ["Next.js", "Hebrew", "React"],
    createdAt: "2 hours ago",
    isResolved: true,
  },
  {
    id: "2",
    title: "Best practices for implementing infinite scroll in a multi-language study reader",
    excerpt: "Looking for recommendations on managing scroll position and performance when rendering thousands of Biblical or Talmudic verses side-by-side...",
    author: "Sarah Cohen",
    avatar: "SC",
    votes: 8,
    answers: 1,
    views: 95,
    tags: ["Performance", "UI/UX", "TypeScript"],
    createdAt: "5 hours ago",
    isResolved: false,
  },
  {
    id: "3",
    title: "Handling RTL layout shifts with CSS Grid and Tailwind",
    excerpt: "What are the cleanest approaches to support seamless switching between LTR and RTL layouts without breaking complex grid definitions?",
    author: "Yitzchak Goldberg",
    avatar: "YG",
    votes: 22,
    answers: 5,
    views: 340,
    tags: ["CSS", "RTL", "Tailwind"],
    createdAt: "1 day ago",
    isResolved: true,
  },
];

const POPULAR_TAGS = ["All", "Next.js", "Hebrew", "React", "Performance", "CSS", "TypeScript", "RTL"];

export default function QAPage() {
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [sortBy, setSortBy] = useState<"newest" | "votes">("votes");
  
  // New Question Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newExcerpt, setNewExcerpt] = useState("");
  const [newTags, setNewTags] = useState("");
  const [authorName, setAuthorName] = useState("");

  // Handle vote increment/decrement
  const handleVote = (id: string, delta: number) => {
    setQuestions(prev =>
      prev.map(q => q.id === id ? { ...q, votes: q.votes + delta } : q)
    );
  };

  // Handle submit new question
  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newExcerpt.trim()) return;

    const newQ: Question = {
      id: Date.now().toString(),
      title: newTitle,
      excerpt: newExcerpt,
      author: authorName.trim() || "Anonymous Scholar",
      avatar: (authorName.trim() ? authorName.substring(0, 2) : "AS").toUpperCase(),
      votes: 1,
      answers: 0,
      views: 1,
      tags: newTags ? newTags.split(",").map(t => t.trim()).filter(Boolean) : ["General"],
      createdAt: "Just now",
      isResolved: false,
    };

    setQuestions([newQ, ...questions]);
    setNewTitle("");
    setNewExcerpt("");
    setNewTags("");
    setAuthorName("");
    setIsModalOpen(false);
  };

  // Filter and sort logic
  const filteredQuestions = questions
    .filter(q => {
      const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            q.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag === "All" || q.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === "votes") return b.votes - a.votes;
      return 0; // default order or add timestamp comparison
    });

  return (
    <main className="container" style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1rem" }}>
      {/* Header */}
      <header className="hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <p className="muted" style={{ marginBottom: "0.5rem" }}>
            <Link href="/library">← Back to Library</Link>
          </p>
          <h1 style={{ fontSize: "2.2rem", fontWeight: "800" }}>Community Q&A</h1>
          <p className="muted">Ask questions, share insights, and discuss text analysis with fellow learners.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            backgroundColor: "var(--primary, #0070f3)",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          Ask Question +
        </button>
      </header>

      {/* Search & Sort Bar */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search questions or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            minWidth: "240px",
            padding: "12px 16px",
            borderRadius: "8px",
            border: "1px solid var(--border, #eaeaea)",
            backgroundColor: "var(--card-bg, #fff)",
            color: "inherit",
            fontSize: "1rem",
          }}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "newest" | "votes")}
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            border: "1px solid var(--border, #eaeaea)",
            backgroundColor: "var(--card-bg, #fff)",
            color: "inherit",
            cursor: "pointer",
          }}
        >
          <option value="votes">Most Voted</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      {/* Tags Filter Bar */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px", marginBottom: "2rem" }}>
        {POPULAR_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: "none",
              backgroundColor: selectedTag === tag ? "var(--primary, #0070f3)" : "var(--card-bg, #f1f1f1)",
              color: selectedTag === tag ? "#fff" : "inherit",
              cursor: "pointer",
              fontSize: "0.85rem",
              whiteSpace: "nowrap",
              fontWeight: selectedTag === tag ? "600" : "normal",
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Question List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filteredQuestions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", background: "var(--card-bg, #fafafa)", borderRadius: "12px" }}>
            <p className="muted">No questions found matching your criteria.</p>
          </div>
        ) : (
          filteredQuestions.map((q) => (
            <div
              key={q.id}
              style={{
                display: "flex",
                gap: "20px",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid var(--border, #eaeaea)",
                backgroundColor: "var(--card-bg, #fff)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                alignItems: "flex-start",
              }}
            >
              {/* Vote Stats Column */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "50px", gap: "4px" }}>
                <button
                  onClick={() => handleVote(q.id, 1)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", color: "inherit" }}
                  title="Upvote"
                >
                  ▲
                </button>
                <span style={{ fontWeight: "bold", fontSize: "1.05rem" }}>{q.votes}</span>
                <button
                  onClick={() => handleVote(q.id, -1)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", color: "inherit" }}
                  title="Downvote"
                >
                  ▼
                </button>
              </div>

              {/* Main Content Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: "600", marginBottom: "6px" }}>
                    <a href={`#question-${q.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                      {q.title}
                    </a>
                  </h3>
                  {q.isResolved && (
                    <span style={{ fontSize: "0.75rem", backgroundColor: "#e1f5fe", color: "#0288d1", padding: "2px 8px", borderRadius: "4px", fontWeight: "bold", whiteSpace: "nowrap" }}>
                      Resolved ✓
                    </span>
                  )}
                </div>

                <p className="muted" style={{ fontSize: "0.95rem", marginBottom: "12px", lineHeight: "1.5" }}>
                  {q.excerpt}
                </p>

                {/* Tags & Meta */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {q.tags.map((t) => (
                      <span key={t} style={{ fontSize: "0.75rem", backgroundColor: "var(--tag-bg, #f0f0f0)", padding: "3px 8px", borderRadius: "4px" }}>
                        {t}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.85rem" }} className="muted">
                    <span>{q.answers} answers</span>
                    <span>•</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#ccc", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "#fff", fontWeight: "bold" }}>
                        {q.avatar}
                      </span>
                      <span>{q.author}</span>
                      <span>{q.createdAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Ask Question Modal / Drawer */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--card-bg, #fff)",
              borderRadius: "12px",
              padding: "2rem",
              width: "100%",
              maxWidth: "600px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              position: "relative",
            }}
          >
            <h2 style={{ marginBottom: "1.5rem", fontSize: "1.5rem" }}>Ask a Public Question</h2>
            
            <form onSubmit={handleSubmitQuestion} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", marginBottom: "6px" }}>Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. David Levi"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border, #ccc)", backgroundColor: "transparent", color: "inherit" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", marginBottom: "6px" }}>Question Title</label>
                <input
                  type="text"
                  required
                  placeholder="Be specific and concise..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border, #ccc)", backgroundColor: "transparent", color: "inherit" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", marginBottom: "6px" }}>Body / Details</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Include details, code snippets, or context for your question..."
                  value={newExcerpt}
                  onChange={(e) => setNewExcerpt(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border, #ccc)", backgroundColor: "transparent", color: "inherit", resize: "vertical" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", marginBottom: "6px" }}>Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Next.js, Hebrew, API"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border, #ccc)", backgroundColor: "transparent", color: "inherit" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: "10px 16px", borderRadius: "6px", border: "1px solid var(--border, #ccc)", background: "transparent", cursor: "pointer", color: "inherit" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "10px 20px", borderRadius: "6px", background: "var(--primary, #0070f3)", color: "#fff", border: "none", cursor: "pointer", fontWeight: "600" }}
                >
                  Post Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}