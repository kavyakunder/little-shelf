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
  readingDays: undefined,
  readingDaysUnit: "days",
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
      setError("A title and author are required.");
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
        bg-[#2b1825]/60 backdrop-blur-md
        p-4 sm:p-6"
      onClick={onCancel}>
      {/* =========================================================
          MODAL
      ========================================================= */}

      <div
        className="relative w-full max-w-2xl max-h-[92vh]
          overflow-hidden
          rounded-[2rem]
          bg-[#fffafc]
          border border-[#f4d9e5]
          shadow-[0_30px_80px_rgba(68,30,50,0.28)]
          animate-[modalIn_.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}>
        {/* =======================================================
            DECORATIVE PINK GLOW
        ======================================================= */}

        <div
          className="absolute -top-24 -right-24
            w-64 h-64
            rounded-full
            bg-[#f8b8d0]/30
            blur-3xl
            pointer-events-none"
        />

        <div
          className="absolute -bottom-24 -left-24
            w-64 h-64
            rounded-full
            bg-[#f4cadb]/25
            blur-3xl
            pointer-events-none"
        />

        {/* =======================================================
            HEADER
        ======================================================= */}

        <div
          className="relative
            px-6 sm:px-8
            pt-6 pb-5
            border-b border-[#f1dce5]">
          <div className="flex items-start justify-between">
            <div>
              <div
                className="inline-flex items-center gap-2
                  px-3 py-1
                  rounded-full
                  bg-[#fde8f0]
                  text-[#b85c7c]
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]">
                <span>♡</span>
                {initial ? "Edit your book" : "New addition"}
              </div>

              <h2
                className="mt-3
                  font-serif
                  text-3xl sm:text-4xl
                  text-[#39232e]
                  leading-tight">
                {initial ? "Update your shelf" : "Add a book"}
              </h2>

              <p className="mt-1 text-sm text-[#39232e]/50">
                {initial
                  ? "Change the details and keep your reading memory fresh."
                  : "Tell your little library about your next read."}
              </p>
            </div>

            <button
              type="button"
              onClick={onCancel}
              aria-label="Close"
              className="flex-shrink-0
                w-9 h-9
                rounded-full
                bg-[#f9edf2]
                text-[#8d6272]
                hover:bg-[#f4dce6]
                hover:text-[#5d3043]
                transition-all
                text-lg">
              ×
            </button>
          </div>
        </div>

        {/* =======================================================
            SCROLLABLE CONTENT
        ======================================================= */}

        <form
          onSubmit={handleSubmit}
          className="relative overflow-y-auto max-h-[calc(92vh-150px)]">
          <div className="px-6 sm:px-8 py-6 space-y-6">
            {/* ===================================================
                ERROR
            =================================================== */}

            {error && (
              <div
                className="flex items-center gap-3
                  rounded-xl
                  border border-red-200
                  bg-red-50
                  px-4 py-3
                  text-sm text-red-600">
                <span>♡</span>
                {error}
              </div>
            )}

            {/* ===================================================
                GOOGLE BOOK SEARCH
            =================================================== */}

            {!initial && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">🔎</span>

                  <label
                    className="text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.18em]
                      text-[#8d6272]">
                    Find your book
                  </label>

                  <span
                    className="text-[9px]
                      px-2 py-0.5
                      rounded-full
                      bg-[#fbeef3]
                      text-[#b85c7c]">
                    optional
                  </span>
                </div>

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

                <p className="mt-2 text-[11px] text-[#39232e]/35">
                  Search for a book and we&apos;ll fill in the details for you
                  ✨
                </p>
              </div>
            )}

            {/* ===================================================
                BOOK BASICS
            =================================================== */}

            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">📖</span>

                <h3
                  className="text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-[#8d6272]">
                  Book details
                </h3>
              </div>

              <div
                className="rounded-2xl
                  border border-[#f0dce5]
                  bg-white/70
                  p-4 sm:p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* TITLE */}

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#5b3948] mb-1.5">
                      Title <span className="text-[#d36b91]">*</span>
                    </label>

                    <input
                      className="w-full
                        rounded-xl
                        border border-[#ead5df]
                        bg-[#fffdfd]
                        px-3.5 py-2.5
                        text-sm text-[#39232e]
                        placeholder:text-[#39232e]/25
                        outline-none
                        transition-all
                        focus:border-[#dc8eaa]
                        focus:ring-4
                        focus:ring-[#f7d8e4]"
                      value={form.title}
                      onChange={(e) => update("title", e.target.value)}
                      placeholder="The Midnight Library"
                    />
                  </div>

                  {/* AUTHOR */}

                  <div>
                    <label className="block text-xs font-medium text-[#5b3948] mb-1.5">
                      Author <span className="text-[#d36b91]">*</span>
                    </label>

                    <input
                      className="w-full
                        rounded-xl
                        border border-[#ead5df]
                        bg-[#fffdfd]
                        px-3.5 py-2.5
                        text-sm text-[#39232e]
                        placeholder:text-[#39232e]/25
                        outline-none
                        focus:border-[#dc8eaa]
                        focus:ring-4
                        focus:ring-[#f7d8e4]"
                      value={form.author}
                      onChange={(e) => update("author", e.target.value)}
                      placeholder="Matt Haig"
                    />
                  </div>

                  {/* GENRE */}

                  {/* STATUS */}

                  <div>
                    <label className="block text-xs font-medium text-[#5b3948] mb-1.5">
                      Reading status
                    </label>

                    <select
                      className="w-full
                        rounded-xl
                        border border-[#ead5df]
                        bg-[#fffdfd]
                        px-3.5 py-2.5
                        text-sm text-[#39232e]
                        outline-none
                        focus:border-[#dc8eaa]
                        focus:ring-4
                        focus:ring-[#f7d8e4]"
                      value={form.status}
                      onChange={(e) =>
                        update("status", e.target.value as ReadStatus)
                      }>
                      <option value="want-to-read">♡ Want to read</option>
                      <option value="reading">◔ Currently reading</option>
                      <option value="read">✓ Finished</option>
                    </select>
                  </div>

                  {/* COVER URL */}
                </div>
              </div>
            </section>

            {/* ===================================================
                RATING
            =================================================== */}

            {form.status === "read" && (
              <section
                className="rounded-2xl
                border border-[#f0dce5]
                bg-[#fff4f8]
                px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p
                      className="text-[10px]
                      uppercase
                      tracking-[0.18em]
                      font-semibold
                      text-[#8d6272]">
                      Your rating
                    </p>

                    <p className="text-xs text-[#39232e]/40 mt-1">
                      How much did this book win you over?
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <StarRating
                      value={form.rating}
                      onChange={(v) => update("rating", v)}
                    />

                    <span className="text-sm font-medium text-[#b85c7c] min-w-[30px]">
                      {form.rating}/5
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* ===================================================
                READING JOURNEY
            =================================================== */}

            {/* <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">🌷</span>

                <h3
                  className="text-[10px]
        font-semibold
        uppercase
        tracking-[0.18em]
        text-[#8d6272]">
                  Your reading journey
                </h3>
              </div>

              <div
                className="rounded-2xl
      border border-[#f0dce5]
      bg-white/70
      p-4 sm:p-5">
                <label className="block text-xs font-medium text-[#5b3948] mb-1.5">
                  How long did it take you?
                </label>

                <p className="text-[11px] text-[#39232e]/40 mb-3">
                  An approximate reading time is totally fine ♡
                </p>

                <div className="flex gap-3">
                  <input
                    type="number"
                    min="1"
                    className="w-28
          rounded-xl
          border border-[#ead5df]
          bg-[#fffdfd]
          px-3.5 py-2.5
          text-sm text-[#39232e]
          placeholder:text-[#39232e]/25
          outline-none
          focus:border-[#dc8eaa]
          focus:ring-4
          focus:ring-[#f7d8e4]"
                    value={form.readingDays ?? ""}
                    onChange={(e) =>
                      update(
                        "readingDays",
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    placeholder="12"
                  />

                  <select
                    className="flex-1
          rounded-xl
          border border-[#ead5df]
          bg-[#fffdfd]
          px-3.5 py-2.5
          text-sm text-[#39232e]
          outline-none
          focus:border-[#dc8eaa]
          focus:ring-4
          focus:ring-[#f7d8e4]"
                    value={form.readingDaysUnit ?? "days"}
                    onChange={(e) => update("readingDaysUnit", e.target.value)}>
                    <option value="days">days</option>
                    <option value="weeks">weeks</option>
                    <option value="months">months</option>
                  </select>
                </div>

                {form.readingDays && (
                  <p className="mt-3 text-xs text-[#b85c7c]">
                    ✨ You spent approximately{" "}
                    <span className="font-semibold">
                      {form.readingDays} {form.readingDaysUnit ?? "days"}
                    </span>{" "}
                    with this book.
                  </p>
                )}
              </div>
            </section> */}

            {/* ===================================================
    READING JOURNEY
=================================================== */}

            {form.status === "read" && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm">🌷</span>

                  <h3
                    className="text-[10px]
          font-semibold
          uppercase
          tracking-[0.18em]
          text-[#8d6272]">
                    Your reading journey
                  </h3>
                </div>

                <div
                  className="rounded-2xl
        border border-[#f0dce5]
        bg-white/70
        p-4 sm:p-5">
                  <label className="block text-xs font-medium text-[#5b3948] mb-1.5">
                    How long did it take you?
                  </label>

                  <p className="text-[11px] text-[#39232e]/40 mb-3">
                    An approximate reading time is totally fine ♡
                  </p>

                  <div className="flex gap-3">
                    <input
                      type="number"
                      min="1"
                      className="w-28
            rounded-xl
            border border-[#ead5df]
            bg-[#fffdfd]
            px-3.5 py-2.5
            text-sm text-[#39232e]
            placeholder:text-[#39232e]/25
            outline-none
            focus:border-[#dc8eaa]
            focus:ring-4
            focus:ring-[#f7d8e4]"
                      value={form.readingDays ?? ""}
                      onChange={(e) =>
                        update(
                          "readingDays",
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                      placeholder="12"
                    />

                    <select
                      className="flex-1
            rounded-xl
            border border-[#ead5df]
            bg-[#fffdfd]
            px-3.5 py-2.5
            text-sm text-[#39232e]
            outline-none
            focus:border-[#dc8eaa]
            focus:ring-4
            focus:ring-[#f7d8e4]"
                      value={form.readingDaysUnit ?? "days"}
                      onChange={(e) =>
                        update(
                          "readingDaysUnit",
                          e.target.value as "days" | "weeks" | "months",
                        )
                      }>
                      <option value="days">days</option>
                      <option value="weeks">weeks</option>
                      <option value="months">months</option>
                    </select>
                  </div>

                  {form.readingDays && (
                    <p className="mt-3 text-xs text-[#b85c7c]">
                      ✨ You spent approximately{" "}
                      <span className="font-semibold">
                        {form.readingDays} {form.readingDaysUnit ?? "days"}
                      </span>{" "}
                      with this book.
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* ===================================================
    NOTES
=================================================== */}

            {form.status === "read" && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm">💌</span>

                  <h3
                    className="text-[10px]
          font-semibold
          uppercase
          tracking-[0.18em]
          text-[#8d6272]">
                    Your thoughts
                  </h3>
                </div>

                <div className="relative">
                  <textarea
                    className="w-full
          min-h-[120px]
          resize-none
          rounded-2xl
          border border-[#ead5df]
          bg-[#fffdfd]
          px-4 py-3
          text-sm
          leading-6
          text-[#39232e]
          placeholder:text-[#39232e]/25
          outline-none
          focus:border-[#dc8eaa]
          focus:ring-4
          focus:ring-[#f7d8e4]"
                    rows={4}
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    placeholder="What stayed with you after reading it?"
                  />

                  <span
                    className="absolute
          right-3
          bottom-3
          text-xs
          text-[#39232e]/20">
                    ♡
                  </span>
                </div>
              </section>
            )}
          </div>

          {/* =====================================================
              FOOTER
          ===================================================== */}

          <div
            className="sticky bottom-0
              flex items-center justify-between
              gap-3
              px-6 sm:px-8
              py-4
              bg-[#fffafc]/95
              backdrop-blur-md
              border-t border-[#f1dce5]">
            <p className="hidden sm:block text-[11px] text-[#39232e]/35">
              {initial
                ? "Your shelf, your story."
                : "Every book deserves a little place on your shelf. ♡"}
            </p>

            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5
                  rounded-xl
                  border border-[#ead5df]
                  bg-white
                  text-sm
                  font-medium
                  text-[#6d4a59]
                  hover:bg-[#fdf3f7]
                  transition-colors">
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5
                  rounded-xl
                  bg-[#d9789c]
                  text-white
                  text-sm
                  font-semibold
                  shadow-[0_6px_18px_rgba(217,120,156,0.25)]
                  hover:bg-[#cc668d]
                  hover:-translate-y-0.5
                  transition-all
                  disabled:opacity-60
                  disabled:hover:translate-y-0">
                {saving
                  ? "Saving..."
                  : initial
                    ? "Save changes ♡"
                    : "Add to my shelf ♡"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
