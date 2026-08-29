"use client";

import { useEffect, useState, useCallback } from "react";
import { Book, NewBookInput, Stats } from "@/lib/types";
import { fetchBooks, fetchStats, createBook, updateBook, deleteBook } from "@/lib/api";
import BookCard from "@/components/BookCard";
import BookForm from "@/components/BookForm";

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");

  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [b, s] = await Promise.all([
        fetchBooks({ search, status: statusFilter, sortBy, order: "desc" }),
        fetchStats(),
      ]);
      setBooks(b);
      setStats(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load books.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sortBy]);

  useEffect(() => {
    const timeout = setTimeout(load, 250); // debounce search
    return () => clearTimeout(timeout);
  }, [load]);

  const handleAdd = async (input: NewBookInput) => {
    await createBook(input);
    setShowForm(false);
    await load();
  };

  const handleUpdate = async (input: NewBookInput) => {
    if (!editingBook) return;
    await updateBook(editingBook.id, input);
    setEditingBook(null);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this book from your shelf?")) return;
    await deleteBook(id);
    await load();
  };

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-stone-200 bg-white/70 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl text-ink">📚 Shelf</h1>
            <p className="text-sm text-ink/50">Your personal reading log</p>
          </div>
          <button
            onClick={() => {
              setEditingBook(null);
              setShowForm(true);
            }}
            className="px-4 py-2 rounded-lg bg-moss text-white hover:bg-moss/90"
          >
            + Add book
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <StatCard label="Total books" value={stats.total} />
            <StatCard label="Read" value={stats.read} />
            <StatCard label="Reading" value={stats.reading} />
            <StatCard label="Want to read" value={stats.wantToRead} />
            <StatCard label="Avg rating" value={stats.avgRating ? `${stats.avgRating} ★` : "—"} />
          </div>
        )}

        <div className="flex flex-wrap gap-3 items-center">
          <input
            className="flex-1 min-w-[200px] rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-moss"
            placeholder="Search by title, author, or genre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="rounded-lg border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-moss"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="want-to-read">Want to read</option>
            <option value="reading">Reading</option>
            <option value="read">Read</option>
          </select>
          <select
            className="rounded-lg border border-stone-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-moss"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="createdAt">Sort: Recently added</option>
            <option value="title">Sort: Title</option>
            <option value="author">Sort: Author</option>
            <option value="rating">Sort: Rating</option>
          </select>
        </div>

        {(showForm || editingBook) && (
          <BookForm
            initial={editingBook}
            onSubmit={editingBook ? handleUpdate : handleAdd}
            onCancel={() => {
              setShowForm(false);
              setEditingBook(null);
            }}
          />
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-center text-ink/40 py-12">Loading your shelf...</p>
        ) : books.length === 0 ? (
          <div className="text-center py-16 text-ink/40">
            <p className="text-lg font-serif">Your shelf is empty.</p>
            <p className="text-sm mt-1">Add the first book you&apos;ve read to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onEdit={() => {
                  setShowForm(false);
                  setEditingBook(book);
                }}
                onDelete={() => handleDelete(book.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 px-4 py-3 text-center">
      <div className="text-2xl font-serif text-ink">{value}</div>
      <div className="text-xs text-ink/50 mt-0.5">{label}</div>
    </div>
  );
}
