"use client";

import { Book } from "@/lib/types";

interface BookCardProps {
  book: Book;
  onOpen: () => void;
}

export default function BookCard({ book, onOpen }: BookCardProps) {
  return (
    <button
      onClick={onOpen}
      aria-label={`Open ${book.title}`}
      className="group relative aspect-[2/3] w-full rounded-xl overflow-hidden border border-stone-200 shadow-sm bg-stone-100 text-left transition-transform duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-moss">
      {book.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
          <span className="font-serif text-5xl text-stone-300">
            {book.title.charAt(0)}
          </span>
        </div>
      )}

      {/* spine shadow, sells the "physical book" feel */}
      <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/25 to-transparent pointer-events-none" />

      {/* title only shows on hover, since the card is otherwise cover-only */}
      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-white text-sm font-serif leading-snug line-clamp-2">
          {book.title}
        </p>
      </div>
    </button>
  );
}
