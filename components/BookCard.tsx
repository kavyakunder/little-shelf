"use client";

import { Book } from "@/lib/types";
import StarRating from "./StarRating";

interface BookCardProps {
  book: Book;
  onEdit: () => void;
  onDelete: () => void;
}

const STATUS_LABEL: Record<Book["status"], string> = {
  "want-to-read": "Want to read",
  reading: "Reading",
  read: "Read",
};

const STATUS_COLOR: Record<Book["status"], string> = {
  "want-to-read": "bg-stone-100 text-stone-600",
  reading: "bg-clay/10 text-clay",
  read: "bg-moss/10 text-moss",
};

export default function BookCard({ book, onEdit, onDelete }: BookCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="h-40 bg-stone-100 flex items-center justify-center overflow-hidden">
        {book.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <span className="font-serif text-4xl text-stone-300">{book.title.charAt(0)}</span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <span
          className={`self-start text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[book.status]}`}
        >
          {STATUS_LABEL[book.status]}
        </span>
        <h3 className="font-serif text-lg text-ink leading-snug">{book.title}</h3>
        <p className="text-sm text-ink/60">{book.author}</p>
        {book.genre && <p className="text-xs text-ink/40">{book.genre}</p>}
        <StarRating value={book.rating} size="sm" />
        {book.notes && (
          <p className="text-sm text-ink/70 line-clamp-3 mt-1 italic">&quot;{book.notes}&quot;</p>
        )}
        <div className="mt-auto flex gap-2 pt-3">
          <button
            onClick={onEdit}
            className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-50"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
