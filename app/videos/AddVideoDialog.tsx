"use client";

import { useRef, useState, type FormEvent } from "react";
import { FiPlus, FiX } from "react-icons/fi";

import { useDialogFocus } from "@/app/components/useDialogFocus";
import {
  VIDEO_CATEGORIES,
  validateVideoId,
  type Video,
  type VideoCategory,
} from "./video-data";
import type { AddVideoOutcome } from "./video-store";

interface AddVideoDialogProps {
  onClose: () => void;
  onAdd: (video: Video) => Promise<AddVideoOutcome>;
  onAdded: (title: string) => void;
}

export default function AddVideoDialog({
  onClose,
  onAdd,
  onAdded,
}: AddVideoDialogProps) {
  const [videoId, setVideoId] = useState("");
  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [category, setCategory] = useState<VideoCategory | "">("");
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const idInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const categorySelectRef = useRef<HTMLSelectElement>(null);
  const dialogRef = useDialogFocus<HTMLDivElement>({
    open: true,
    onClose: close,
    initialFocus: idInputRef,
  });

  function close() {
    if (!isSaving) onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    const id = videoId.trim();
    const idError = validateVideoId(id);
    if (idError) {
      setFormError(idError);
      idInputRef.current?.focus();
      return;
    }

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setFormError("Add a title so the video is easy to find.");
      titleInputRef.current?.focus();
      return;
    }

    if (!category) {
      setFormError("Choose a category for this video.");
      categorySelectRef.current?.focus();
      return;
    }

    const video: Video = {
      id,
      title: cleanTitle.slice(0, 140),
      speaker: speaker.trim().slice(0, 80),
      category,
    };

    setIsSaving(true);
    setFormError("");

    const outcome = await onAdd(video);
    setIsSaving(false);

    if (outcome === "duplicate") {
      setFormError("That video is already in the library.");
      idInputRef.current?.focus();
      return;
    }

    if (outcome === "unavailable") {
      setFormError(
        "Could not save to the shared library. Check your connection and try again.",
      );
      return;
    }

    onAdded(video.title);
    onClose();
  }

  return (
    <div
      className="video-add-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        id="video-add-dialog"
        className="video-add-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-add-dialog-title"
        aria-describedby="video-add-dialog-desc"
      >
        <div className="video-add-head">
          <div>
            <p className="videos-kicker">New video</p>
            <h2 id="video-add-dialog-title">Add a video</h2>
          </div>
          <button
            type="button"
            className="video-add-close"
            onClick={close}
            disabled={isSaving}
            aria-label="Close dialog"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>

        <p className="video-add-desc" id="video-add-dialog-desc">
          Paste just the YouTube video ID — no full link needed. Videos you add
          are saved to the shared library.
        </p>

        <form className="video-add-form" onSubmit={handleSubmit} noValidate>
          <div className="video-add-field">
            <label className="video-add-label" htmlFor="video-id">
              YouTube video ID
              <span className="video-add-required">Required</span>
            </label>
            <input
              ref={idInputRef}
              id="video-id"
              className="input video-id-input"
              type="text"
              placeholder="JHeBK-2JDz0"
              value={videoId}
              onChange={(event) => {
                setVideoId(event.target.value);
                setFormError("");
              }}
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
              aria-describedby="video-id-hint"
            />
            <p className="video-add-hint" id="video-id-hint">
              Paste the 11-character ID from the video link — not the whole
              URL.
            </p>
          </div>

          <div className="video-add-field">
            <label className="video-add-label" htmlFor="video-title">
              Title
              <span className="video-add-required">Required</span>
            </label>
            <input
              ref={titleInputRef}
              id="video-title"
              className="input"
              type="text"
              placeholder="e.g. The meaning of Sukkot"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setFormError("");
              }}
              maxLength={140}
              autoComplete="off"
              required
            />
          </div>

          <div className="video-add-field">
            <label className="video-add-label" htmlFor="video-speaker">
              Name
              <span className="video-add-optional">Optional</span>
            </label>
            <input
              id="video-speaker"
              className="input"
              type="text"
              placeholder="e.g. Rabbi Jason Sobel"
              value={speaker}
              onChange={(event) => {
                setSpeaker(event.target.value);
                setFormError("");
              }}
              maxLength={80}
              autoComplete="off"
            />
          </div>

          <div className="video-add-field">
            <label className="video-add-label" htmlFor="video-category">
              Category
              <span className="video-add-required">Required</span>
            </label>
            <select
              ref={categorySelectRef}
              id="video-category"
              className="input select video-category-select"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value as VideoCategory | "");
                setFormError("");
              }}
              required
            >
              <option value="">Choose a category</option>
              {VIDEO_CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {formError && (
            <p className="video-add-error" role="alert">
              {formError}
            </p>
          )}

          <div className="video-add-actions">
            <button
              type="button"
              className="btn video-add-cancel"
              onClick={close}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn video-add-submit"
              disabled={isSaving}
              aria-busy={isSaving}
            >
              <FiPlus aria-hidden="true" />
              {isSaving ? "Adding…" : "Add video"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
