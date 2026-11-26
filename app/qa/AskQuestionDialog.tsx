"use client";

import { useRef, useState, type FormEvent } from "react";
import { FiArrowUpCircle, FiX } from "react-icons/fi";

import { useDialogFocus } from "@/app/components/useDialogFocus";

export interface QuestionDraft {
  title: string;
  excerpt: string;
  author: string;
  tags: string[];
}

interface AskQuestionDialogProps {
  onClose: () => void;
  onPost: (draft: QuestionDraft) => void;
}

export default function AskQuestionDialog({
  onClose,
  onPost,
}: AskQuestionDialogProps) {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState("");
  const [author, setAuthor] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);
  const dialogRef = useDialogFocus<HTMLDivElement>({
    open: true,
    onClose,
    initialFocus: titleRef,
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !excerpt.trim()) return;

    onPost({
      title: title.trim(),
      excerpt: excerpt.trim(),
      author: author.trim() || "Anonymous",
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
  }

  return (
    <div
      className="qa-modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="qa-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="qa-modal-title"
        aria-describedby="qa-modal-desc"
      >
        <div className="qa-modal-head">
          <div>
            <p className="qa-kicker">New question</p>
            <h2 id="qa-modal-title">Ask the Community</h2>
          </div>
          <button
            type="button"
            className="qa-modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>

        <p className="qa-modal-desc" id="qa-modal-desc">
          Share enough context for others to learn with you. Questions and
          answers stay in this browser.
        </p>

        <form onSubmit={handleSubmit} className="qa-form">
          <div className="qa-field">
            <label className="qa-label" htmlFor="qa-author">
              Your name <span className="qa-optional">Optional</span>
            </label>
            <input
              id="qa-author"
              className="input"
              type="text"
              placeholder="e.g. David L."
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="qa-field">
            <label className="qa-label" htmlFor="qa-title">
              Question title <span className="qa-required">Required</span>
            </label>
            <input
              ref={titleRef}
              id="qa-title"
              className="input"
              type="text"
              placeholder="e.g. What does 'chesed' mean in Genesis 24?"
              required
              maxLength={180}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className="qa-field">
            <label className="qa-label" htmlFor="qa-details">
              Details <span className="qa-required">Required</span>
            </label>
            <textarea
              id="qa-details"
              className="input qa-textarea"
              placeholder="Give some context — sources, what you've read, where you're stuck…"
              required
              maxLength={2000}
              rows={5}
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
            />
          </div>

          <div className="qa-field">
            <label className="qa-label" htmlFor="qa-tags">
              Tags <span className="qa-optional">Comma separated</span>
            </label>
            <input
              id="qa-tags"
              className="input"
              type="text"
              placeholder="e.g. Torah, Parasha"
              maxLength={120}
              value={tags}
              onChange={(event) => setTags(event.target.value)}
            />
          </div>

          <div className="qa-form-actions">
            <button
              type="button"
              className="btn qa-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn qa-submit">
              <FiArrowUpCircle aria-hidden="true" />
              Post Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
