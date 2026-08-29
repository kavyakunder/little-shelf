"use client";

import { useState, FormEvent } from "react";
import { Book, NewBookInput, ReadStatus } from "@/lib/types";
import StarRating from "./StarRating";
import GoogleBookSearch from "@/components/GoogleBookSearch";

interface BookFormProps {
  initial?: Book | null;
  onSubmit: (input: NewBookInput) => Promise<void>;
  onCancel: () => void;
}

const EMPTY: NewBookInput = {
  title: "",
  author: "",
  rating: 0,
  status: "want-to-read",
  genre: "",
  coverUrl: "",
  notes: "",
  dateStarted: "",
  dateFinished: "",
};

export default function BookForm({
  initial,
  onSubmit,
  onCancel,
}: BookFormProps) {
  const [form, setForm] = useState<NewBookInput>(
    initial
      ? {
          title: initial.title,
          author: initial.author,
          rating: initial.rating,
          status: initial.status,
          genre: initial.genre ?? "",
          coverUrl: initial.coverUrl ?? "",
          notes: initial.notes ?? "",
          dateStarted: initial.dateStarted ?? "",
          dateFinished: initial.dateFinished ?? "",
        }
      : EMPTY,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof NewBookInput>(
    key: K,
    value: NewBookInput[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim()) {
      setError("Title and author are required.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-lg p-6 space-y-4 border border-stone-200">
      <h2 className="font-serif text-2xl text-ink">
        {initial ? "Edit book" : "Add a book"}
      </h2>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      xddd
      <GoogleBookSearch
        onSelect={(book) => {
          setForm((prev) => ({
            ...prev,

            title: book.title,
            author: book.author,

            coverUrl: book.coverUrl ?? "",
            isbn: book.isbn ?? "",

            description: book.description ?? "",

            pages: book.pages ? String(book.pages) : "",

            publisher: book.publisher ?? "",
            genre: book.genre ?? "",
          }));
        }}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">
            Title *
          </label>
          <input
            className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-moss"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="The Hobbit"
          />
          {/* <GoogleBookSearch
            onSelect={(book) => {
              setForm((prev) => ({
                ...prev,

                title: book.title,
                author: book.author,

                coverUrl: book.coverUrl ?? "",
                isbn: book.isbn ?? "",

                description: book.description ?? "",

                pages: book.pages ? String(book.pages) : "",

                publisher: book.publisher ?? "",
                genre: book.genre ?? "",
              }));
            }}
          /> */}
        </div>
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">
            Author *
          </label>
          <input
            className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-moss"
            value={form.author}
            onChange={(e) => update("author", e.target.value)}
            placeholder="J.R.R. Tolkien"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">
            Genre
          </label>
          <input
            className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-moss"
            value={form.genre}
            onChange={(e) => update("genre", e.target.value)}
            placeholder="Fantasy"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">
            Status
          </label>
          <select
            className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-moss bg-white"
            value={form.status}
            onChange={(e) => update("status", e.target.value as ReadStatus)}>
            <option value="want-to-read">Want to read</option>
            <option value="reading">Currently reading</option>
            <option value="read">Read</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">
            Cover image URL
          </label>
          <input
            className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-moss"
            value={form.coverUrl}
            onChange={(e) => update("coverUrl", e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">
            Your rating
          </label>
          <StarRating
            value={form.rating}
            onChange={(v) => update("rating", v)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">
            Date started
          </label>
          <input
            type="date"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-moss"
            value={form.dateStarted}
            onChange={(e) => update("dateStarted", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">
            Date finished
          </label>
          <input
            type="date"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-moss"
            value={form.dateFinished}
            onChange={(e) => update("dateFinished", e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-ink/70 mb-1">
          Notes / review
        </label>
        <textarea
          className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-moss"
          rows={3}
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="What did you think?"
        />
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-stone-300 text-ink/70 hover:bg-stone-50">
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-moss text-white hover:bg-moss/90 disabled:opacity-60">
          {saving ? "Saving..." : initial ? "Save changes" : "Add book"}
        </button>
      </div>
    </form>
  );
}
