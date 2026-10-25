// app/qa/page.tsx
"use client";

import { useState } from "react";

const initialPosts = [
  {
    id: 1,
    author: "Miriam",
    question: "What does 'chesed' mean in Genesis 24:12?",
    votes: 12,
  },
  {
    id: 2,
    author: "David",
    question: "How do I start reading the Torah regularly?",
    votes: 8,
  },
];

export default function QaPage() {
  // useState: "posts" is the data, "setPosts" changes it.
  // React re-renders the list every time setPosts is called.
  const [posts, setPosts] = useState(initialPosts);
  const [newQuestion, setNewQuestion] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // stop the browser from reloading the page
    if (!newQuestion.trim()) return; // ignore empty posts

    const post = {
      id: Date.now(), // simple unique id: current timestamp
      author: "You",
      question: newQuestion,
      votes: 0,
    };

    setPosts([post, ...posts]); // new post first, then the old ones
    setNewQuestion(""); // clear the input box
  }

  function handleVote(id: number) {
    setPosts(
      posts.map((p) => (p.id === id ? { ...p, votes: p.votes + 1 } : p)),
    );
  }

  return (
    <main className="container">
      <header className="hero">
        <h1>Q&amp;A</h1>
        <p className="muted">Ask the community</p>
      </header>

      <form className="qa-form" onSubmit={handleSubmit}>
        <input
          className="input"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Ask a question or share a thought…"
        />
        <button className="btn" type="submit">
          Post
        </button>
      </form>

      <div className="stack">
        {posts.map((post) => (
          <article key={post.id} className="card qa-card">
            <div>
              <strong>{post.author}</strong>
              <p className="qa-question">{post.question}</p>
            </div>
            <button
              className="vote-btn"
              onClick={() => handleVote(post.id)}
            >
              ▲ {post.votes}
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}