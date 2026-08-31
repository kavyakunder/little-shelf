"use client";

import { useEffect, useState } from "react";
import { GoogleBook, searchGoogleBooks } from "@/lib/api";
interface GoogleBookSearchProps {
  onSelect: (book: GoogleBook) => void;
}

export default function GoogleBookSearch({ onSelect }: GoogleBookSearchProps) {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<GoogleBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setBooks([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const results = await searchGoogleBooks(query);

        setBooks(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed.");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium text-ink">Find my book</label>

        <p className="text-xs text-ink/50 mt-1">
          Search Google Books and select a book to automatically fill in its
          details.
        </p>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by book title or author..."
        className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-moss"
      />
      {loading && (
        <p className="text-sm text-ink/50">Searching Google Books...</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {books.length > 0 && (
        <div className="max-h-96 overflow-y-auto rounded-xl border border-stone-200 bg-white">
          {books.map((book) => (
            <button
              key={book.id}
              type="button"
              onClick={() => {
                onSelect(book);
                setQuery("");
                setBooks([]);
              }}
              className="flex w-full gap-4 border-b border-stone-100 p-4 text-left transition last:border-b-0 hover:bg-stone-50">
              <div className="h-24 w-16 shrink-0 overflow-hidden rounded bg-stone-100">
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-ink/30">
                    No cover
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h3 className="font-serif text-lg text-ink">{book.title}</h3>

                <p className="text-sm text-ink/60">{book.author}</p>

                {book.publisher && (
                  <p className="mt-1 text-xs text-ink/40">{book.publisher}</p>
                )}

                {book.pages && (
                  <p className="mt-1 text-xs text-ink/40">{book.pages} pages</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
      {!loading && query.trim() && books.length === 0 && !error && (
        <p className="text-sm text-ink/40">No books found.</p>
      )}
    </div>
  );
}
