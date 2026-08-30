"use client";

import { useEffect, useState, useCallback } from "react";
import { Book, NewBookInput, Stats } from "@/lib/types";
import {
  fetchBooks,
  fetchStats,
  createBook,
  updateBook,
  deleteBook,
} from "@/lib/api";
import BookCard from "@/components/BookCard";
import BookForm from "@/components/BookForm";
import BookModal from "@/components/BookModal";

/*
 * Free-to-use photos (Unsplash License, no attribution required) for
 * the pinned mood board and as a placeholder cover for books that
 * don't have one of their own yet.
 */
const MOOD_PHOTOS = [
  {
    src: "https://images.unsplash.com/photo-1752824 250580-163f1532b1d0?auto=format&fit=crop&w=500&q=80",
    caption: "cozy corners",
    tilt: "-rotate-6",
  },
  {
    src: "https://images.unsplash.com/photo-1766240571698-f1d05679e67a?auto=format&fit=crop&w=500&q=80",
    caption: "tea + pages",
    tilt: "rotate-3",
  },
  {
    src: "https://images.unsplash.com/photo-1753187991848-8a7e17d232a8?auto=format&fit=crop&w=500&q=80",
    caption: "sunlit shelves",
    tilt: "-rotate-2",
  },
];

const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1766240571698-f1d05679e67a?auto=format&fit=crop&w=200&q=80";

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openedBook, setOpenedBook] = useState<Book | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");

  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Gentle mouse-parallax tilt for the reading-room illustration.
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [b, s] = await Promise.all([
        fetchBooks({
          search,
          status: statusFilter,
          sortBy,
          order: "desc",
        }),
        fetchStats(),
      ]);

      setBooks(b);
      setStats(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sortBy]);

  useEffect(() => {
    const timeout = setTimeout(load, 250);
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
    setOpenedBook(null);

    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this book from your little shelf?")) return;

    await deleteBook(id);
    setOpenedBook(null);

    await load();
  };

  /*
   * Pick a random book for the "Surprise me" feature.
   */
  const surpriseBook = () => {
    if (!books.length) return;

    const randomBook = books[Math.floor(Math.random() * books.length)];

    setOpenedBook(randomBook);
  };

  const handleRoomMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -8, y: px * 10 });
  };

  const handleRoomMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div className="min-h-screen overflow-hidden bg-[#fff8fa] text-[#49373d]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&display=swap');
        .font-hand { font-family: 'Caveat', cursive; }

        @keyframes lamp-glow {
          0%, 100% { opacity: .35; transform: scale(1); }
          50% { opacity: .6; transform: scale(1.12); }
        }
        @keyframes dust-float {
          0% { transform: translateY(0); opacity: 0; }
          20% { opacity: .8; }
          100% { transform: translateY(-70px); opacity: 0; }
        }
        @keyframes book-breathe {
          0%, 100% { transform: translateX(-50%) rotate(-7deg); }
          50% { transform: translateX(-50%) rotate(-4deg); }
        }
        @keyframes heart-pop {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          20% { opacity: 1; transform: translateY(-6px) scale(1.1); }
          100% { transform: translateY(-46px) scale(0.9); opacity: 0; }
        }
        @keyframes card-rise {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .card-rise {
          animation: card-rise 420ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>

      {/* =========================================================
          BACKGROUND
      ========================================================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* soft blobs */}
        <div className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-[#f9d8e2]/50 blur-3xl" />

        <div className="absolute -left-40 top-[40%] h-[420px] w-[420px] rounded-full bg-[#fce8ee]/70 blur-3xl" />

        <div className="absolute bottom-[-180px] right-[25%] h-[450px] w-[450px] rounded-full bg-[#f7d3df]/30 blur-3xl" />

        {/* floating decorations */}
        <span className="absolute left-[8%] top-[18%] rotate-12 text-xl text-[#df91a7]/50">
          ✦
        </span>

        <span className="absolute right-[12%] top-[28%] text-2xl text-[#e8a9ba]/40">
          ♡
        </span>

        <span className="absolute bottom-[18%] left-[13%] text-xl text-[#e8a9ba]/40">
          ✿
        </span>

        <span className="absolute bottom-[30%] right-[7%] rotate-12 text-sm text-[#df91a7]/50">
          ✦
        </span>
      </div>

      {/* =========================================================
          HEADER
      ========================================================= */}

      <header className="sticky top-0 z-30 border-b border-[#f1dce2] bg-[#fff8fa]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-11 w-11 rotate-[-5deg] items-center justify-center rounded-[16px] bg-[#d96b87] text-2xl text-white shadow-[0_5px_18px_rgba(217,107,135,0.25)]">
                📖
              </div>

              <span className="absolute -right-2 -top-2 text-xs">✨</span>
            </div>

            <div>
              <h1 className="font-serif text-2xl tracking-tight">
                My Little Shelf
              </h1>

              <p className="text-[11px] text-[#49373d]/40">
                a home for your stories ♡
              </p>
            </div>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={surpriseBook}
              disabled={!books.length}
              className="hidden rounded-full border border-[#efd6de] bg-white/70 px-4 py-2 text-xs font-medium text-[#c95778] transition hover:-translate-y-0.5 hover:bg-[#fff0f4] disabled:cursor-not-allowed disabled:opacity-40 sm:block">
              🎲 Surprise me
            </button>

            <button
              onClick={() => {
                setEditingBook(null);
                setShowForm(true);
              }}
              className="group flex items-center gap-2 rounded-full bg-[#d96b87] px-4 py-2.5 text-sm font-medium text-white shadow-[0_5px_18px_rgba(217,107,135,0.25)] transition hover:-translate-y-0.5 hover:bg-[#c95778] hover:shadow-lg active:scale-95">
              <span className="text-lg transition-transform duration-300 group-hover:rotate-90">
                +
              </span>

              <span className="hidden sm:inline">Add a book</span>

              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================
          MAIN
      ========================================================= */}

      <main className="relative mx-auto max-w-6xl px-6 py-10">
        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative mb-12">
          <div className="grid items-center gap-10 md:grid-cols-[1fr_300px]">
            {/* left */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#f1d2dc] bg-[#fff0f4] px-3.5 py-1.5 text-xs font-medium text-[#c95778]">
                <span>🌸</span>
                your little reading world
                <span>♡</span>
              </div>

              <h2 className="max-w-2xl font-serif text-5xl leading-[0.98] tracking-tight md:text-6xl">
                Stories you
                <br />
                <span className="italic text-[#d96b87]">
                  never want to forget.
                </span>
              </h2>

              <p className="mt-5 max-w-lg text-sm leading-7 text-[#49373d]/45">
                A tiny corner of the internet where your books, thoughts,
                favourites and unfinished adventures can live together. ✨
              </p>

              {/* mini actions */}
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    setEditingBook(null);
                    setShowForm(true);
                  }}
                  className="rounded-full bg-[#49373d] px-5 py-2.5 text-sm text-white transition hover:-translate-y-0.5 hover:bg-[#382a2f]">
                  + Add your next story
                </button>

                <button
                  onClick={surpriseBook}
                  disabled={!books.length}
                  className="rounded-full border border-[#efd6de] bg-white/70 px-5 py-2.5 text-sm text-[#c95778] transition hover:-translate-y-0.5 hover:bg-[#fff0f4] disabled:opacity-40">
                  🎀 Pick one for me
                </button>
              </div>
            </div>

            {/* little reading room — now with a gentle parallax tilt */}
            <div
              className="relative mx-auto w-full max-w-[290px]"
              style={{ perspective: "900px" }}
              onMouseMove={handleRoomMouseMove}
              onMouseLeave={handleRoomMouseLeave}>
              <div
                className="relative h-[290px] overflow-hidden rounded-[38px] border border-[#f0d5dd] bg-[#fdebef] shadow-[0_20px_50px_rgba(217,107,135,0.10)]"
                style={{
                  transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                  transition: "transform 150ms ease-out",
                  transformStyle: "preserve-3d",
                }}>
                {/* window */}
                <div className="absolute left-8 top-7 h-[105px] w-[100px] rounded-t-full border-[6px] border-[#e4a9b8] bg-[#f9dfe6]">
                  <div className="absolute left-1/2 top-0 h-full w-[3px] -translate-x-1/2 bg-[#e4a9b8]" />
                  <div className="absolute left-0 top-1/2 h-[3px] w-full -translate-y-1/2 bg-[#e4a9b8]" />

                  <span className="absolute -right-5 top-2 text-lg">☁️</span>
                </div>

                {/* lamp, with a soft breathing glow */}
                <div className="absolute right-8 top-12">
                  <span
                    aria-hidden
                    className="absolute -left-4 -top-4 h-16 w-16 rounded-full bg-[#ffe3ea] blur-xl"
                    style={{ animation: "lamp-glow 3.2s ease-in-out infinite" }}
                  />
                  <div className="relative mx-auto h-12 w-12 rounded-t-full bg-[#f4c2ce]" />
                  <div className="relative mx-auto h-16 w-1 bg-[#c98a9d]" />
                  <div className="relative mx-auto h-2 w-12 rounded-full bg-[#c98a9d]" />
                </div>

                {/* plant */}
                <div className="absolute bottom-9 left-7">
                  <div className="mx-auto h-14 w-10 rounded-b-xl rounded-t-[50%] bg-[#d99aa9]" />
                  <span className="absolute -left-4 -top-7 text-2xl">🌿</span>
                </div>

                {/* chair */}
                <div className="absolute bottom-7 right-8">
                  <div className="h-20 w-20 rounded-t-[35px] bg-[#d77d96]" />
                  <div className="absolute -bottom-5 left-2 h-7 w-3 bg-[#ad6c7e]" />
                  <div className="absolute -bottom-5 right-2 h-7 w-3 bg-[#ad6c7e]" />
                </div>

                {/* book — a slow, barely-there breathing sway */}
                <div
                  className="absolute bottom-10 left-1/2"
                  style={{ animation: "book-breathe 5s ease-in-out infinite" }}>
                  <div className="relative h-12 w-16 rounded-r-md rounded-l-sm bg-[#fffafc] shadow-md">
                    <div className="absolute left-2 top-3 h-1 w-9 rounded bg-[#e7b2c0]" />
                    <div className="absolute left-2 top-6 h-1 w-6 rounded bg-[#f0ced7]" />
                  </div>
                </div>

                {/* drifting dust motes */}
                <span
                  className="absolute left-[30%] top-[55%] h-1 w-1 rounded-full bg-[#e7b2c0]"
                  style={{ animation: "dust-float 4.5s ease-in-out infinite" }}
                />
                <span
                  className="absolute left-[60%] top-[62%] h-1 w-1 rounded-full bg-[#e7b2c0]"
                  style={{
                    animation: "dust-float 5.5s ease-in-out infinite 1.5s",
                  }}
                />
                <span
                  className="absolute left-[45%] top-[70%] h-[3px] w-[3px] rounded-full bg-[#e7b2c0]"
                  style={{
                    animation: "dust-float 6.5s ease-in-out infinite 3s",
                  }}
                />

                {/* decorations */}
                <span className="absolute right-5 top-5 text-sm">✨</span>

                <span className="absolute bottom-4 left-[42%] text-xs">♡</span>
              </div>

              <div className="absolute -bottom-3 -right-3 rounded-2xl border border-[#f0d5dd] bg-white px-4 py-2 shadow-md">
                <span className="font-hand text-sm text-[#49373d]/60">
                  currently reading ♡
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            STATS — NOT NORMAL STAT CARDS
        ===================================================== */}

        {stats && (
          <section className="mb-12">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#d96b87]">
                  little milestones
                </p>

                <h3 className="mt-1 font-serif text-2xl">Your reading life</h3>
              </div>

              <span className="text-xs text-[#49373d]/30">keep going ✨</span>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <TotalMilestone value={stats.total} books={books} />

              <Milestone
                icon="🌷"
                value={stats.read}
                label="stories finished"
                active
              />

              <Milestone
                icon="☕"
                value={stats.reading}
                label="currently reading"
              />

              <Milestone
                icon="⭐"
                value={stats.avgRating || "—"}
                label="average rating"
              />
            </div>
          </section>
        )}

        {/* =====================================================
            SEARCH
        ===================================================== */}

        <section className="mb-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm">
                🔍
              </span>

              <input
                className="w-full rounded-2xl border border-[#efdce2] bg-white/70 py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#49373d]/25 focus:border-[#e7a9ba] focus:bg-white focus:ring-4 focus:ring-[#f7dbe3]/50"
                placeholder="Search through your little worlds..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <select
                className="rounded-2xl border border-[#efdce2] bg-white/70 px-4 py-3.5 text-xs text-[#49373d]/60 outline-none focus:border-[#e7a9ba]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">♡ Everything</option>
                <option value="want-to-read">💌 Want to read</option>
                <option value="reading">☕ Reading</option>
                <option value="read">🌷 Finished</option>
              </select>
            </div>
          </div>
        </section>

        {/* =====================================================
            FORM
        ===================================================== */}

        {(showForm || (editingBook && !openedBook)) && (
          <div className="mb-10">
            <BookForm
              initial={editingBook}
              onSubmit={editingBook ? handleUpdate : handleAdd}
              onCancel={() => {
                setShowForm(false);
                setEditingBook(null);
              }}
            />
          </div>
        )}

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="mb-8 rounded-2xl border border-[#f1c5cf] bg-[#fff0f3] px-4 py-3 text-sm text-[#b94d68]">
            💗 {error}
          </div>
        )}

        {/* =====================================================
            BOOKSHELF
        ===================================================== */}

        {loading ? (
          <LoadingShelf />
        ) : books.length === 0 ? (
          <EmptyShelf
            onAdd={() => {
              setEditingBook(null);
              setShowForm(true);
            }}
          />
        ) : (
          <section>
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#d96b87]">
                  the collection
                </p>

                <h3 className="mt-1 font-serif text-3xl">
                  Your bookshelf <span className="text-[#e6a2b4]">♡</span>
                </h3>
              </div>

              <span className="rounded-full bg-[#fde8ee] px-3 py-1.5 text-xs text-[#c95778]">
                {books.length} {books.length === 1 ? "story" : "stories"}
              </span>
            </div>

            {/* Shelf container */}
            <div className="relative rounded-[32px] border border-[#efd8df] bg-[#fffdfd]/70 p-5 pb-9 shadow-[0_12px_35px_rgba(217,107,135,0.06)]">
              {/* little shelf label */}
              <div className="mb-6 flex items-center justify-center">
                <div className="rounded-full bg-[#fff0f4] px-4 py-1.5 text-[10px] uppercase tracking-[0.18em] text-[#c95778]">
                  ✦ books that live here ✦
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {books.map((book, i) => (
                  <div
                    key={book.id}
                    className="card-rise transition-transform duration-300 hover:-translate-y-1"
                    style={{ animationDelay: `${Math.min(i, 10) * 35}ms` }}>
                    <BookCard book={book} onOpen={() => setOpenedBook(book)} />
                  </div>
                ))}
              </div>

              {/* wooden-ish shelf line */}
              <div className="mt-7 h-3 rounded-full bg-[#e6b6c2]/60 shadow-[0_4px_0_#dca4b2]" />

              <div className="mt-3 flex justify-center gap-5 text-xs text-[#d99aaa]/50">
                <span>🌷</span>
                <span>♡</span>
                <span>🌷</span>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================
            FOOTER MESSAGE
        ===================================================== */}

        {books.length > 0 && (
          <section className="py-16 text-center">
            <div className="mx-auto mb-3 flex w-fit items-center gap-3 text-[#e4a0b2]">
              <span>✦</span>
              <span>♡</span>
              <span>✦</span>
            </div>

            <p className="font-serif text-xl italic text-[#49373d]/45">
              Every story leaves a little piece of itself behind.
            </p>

            <p className="mt-2 font-hand text-base text-[#c95778]/70">
              keep reading, keep collecting, keep dreaming 🌸
            </p>
          </section>
        )}
      </main>

      {/* =========================================================
          MODAL
      ========================================================= */}

      {openedBook && !editingBook && (
        <BookModal
          book={openedBook}
          onClose={() => setOpenedBook(null)}
          onEdit={() => setEditingBook(openedBook)}
          onDelete={() => handleDelete(openedBook.id)}
        />
      )}
    </div>
  );
}

/* ===============================================================
   MILESTONE
================================================================ */

function Milestone({
  icon,
  value,
  label,
  active = false,
}: {
  icon: string;
  value: string | number;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-[22px] border p-5 transition-all duration-300 hover:-translate-y-1 ${
        active
          ? "border-[#efc7d2] bg-[#fff0f4]"
          : "border-[#f0dce2] bg-white/65"
      }`}>
      <div className="absolute -right-5 -top-5 text-6xl opacity-[0.035]">
        {icon}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xl">{icon}</span>

        {active && (
          <span className="rounded-full bg-white/70 px-2 py-1 text-[9px] text-[#d96b87]">
            yay ♡
          </span>
        )}
      </div>

      <div className="mt-3 font-serif text-3xl">{value}</div>

      <p className="mt-1 text-[11px] text-[#49373d]/40">{label}</p>
    </div>
  );
}

/* ===============================================================
   TOTAL MILESTONE — flips over on tap to peek at your shelf
================================================================ */

function TotalMilestone({ value, books }: { value: number; books: Book[] }) {
  const [flipped, setFlipped] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; left: number }[]>([]);

  const preview = books.slice(0, 4);

  const handleClick = () => {
    setFlipped((f) => !f);

    // little heart burst, purely for delight
    const burst = Array.from({ length: 5 }, () => ({
      id: Math.random(),
      left: 20 + Math.random() * 60,
    }));
    setHearts((h) => [...h, ...burst]);
  };

  const removeHeart = (id: number) =>
    setHearts((h) => h.filter((heart) => heart.id !== id));

  return (
    <button
      onClick={handleClick}
      aria-label="Peek at your shelf"
      className="relative block w-full text-left [perspective:900px]">
      {hearts.map((heart) => (
        <span
          key={heart.id}
          onAnimationEnd={() => removeHeart(heart.id)}
          className="pointer-events-none absolute bottom-2 z-20 text-sm text-[#d96b87]"
          style={{
            left: `${heart.left}%`,
            animation: "heart-pop 900ms ease-out forwards",
          }}>
          ♡
        </span>
      ))}

      <div
        className="relative h-[150px] transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}>
        {/* FRONT */}
        <div
          className="group absolute inset-0 overflow-hidden rounded-[22px] border border-[#f0dce2] bg-white/65 p-5 transition-colors duration-300 hover:bg-[#fff0f4]"
          style={{ backfaceVisibility: "hidden" }}>
          <div className="absolute -right-5 -top-5 text-6xl opacity-[0.035]">
            📚
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xl">📚</span>
          </div>

          <div className="mt-3 font-serif text-3xl">{value}</div>

          <p className="mt-1 text-[11px] text-[#49373d]/40">
            stories collected
          </p>

          <p className="font-hand absolute bottom-2 right-3 text-xs text-[#d96b87]/60">
            tap to peek ✨
          </p>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[22px] border border-[#efc7d2] bg-[#fff0f4] p-4"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}>
          <p className="text-center font-hand text-sm text-[#c95778]">
            your shelf ♡
          </p>

          {preview.length > 0 ? (
            <div className="mt-2 flex -space-x-3 justify-center">
              {preview.map((book, i) => (
                <div
                  key={book.id}
                  className="h-14 w-10 shrink-0 overflow-hidden rounded-md border-2 border-white shadow-md"
                  style={{
                    transform: `rotate(${(i - (preview.length - 1) / 2) * 9}deg)`,
                    zIndex: preview.length - i,
                  }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={book.coverUrl || FALLBACK_COVER}
                    alt={book.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-center text-xs text-[#49373d]/35">
              nothing here yet ♡
            </p>
          )}

          <p className="mt-3 text-center text-[10px] text-[#49373d]/35">
            tap to flip back
          </p>
        </div>
      </div>
    </button>
  );
}

/* ===============================================================
   LOADING
================================================================ */

function LoadingShelf() {
  return (
    <div className="rounded-[32px] border border-[#efd8df] bg-white/50 px-6 py-20 text-center">
      <div className="relative mx-auto mb-5 w-fit">
        <div className="flex h-20 w-20 animate-pulse items-center justify-center rounded-[28px] bg-[#fde1e8] text-4xl">
          📚
        </div>

        <span className="absolute -right-2 -top-3 animate-bounce text-sm">
          ✨
        </span>
      </div>

      <h3 className="font-serif text-2xl text-[#49373d]/60">
        Dusting off the bookshelf...
      </h3>

      <p className="mt-2 text-xs text-[#49373d]/30">
        Your stories are getting ready ♡
      </p>
    </div>
  );
}

/* ===============================================================
   EMPTY SHELF
================================================================ */

function EmptyShelf({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-[34px] border border-dashed border-[#e6bdc9] bg-white/45 px-6 py-24 text-center">
      {/* decorations */}
      <span className="absolute left-[10%] top-10 rotate-[-15deg] text-xl text-[#e2a1b3]">
        ✦
      </span>

      <span className="absolute right-[12%] top-16 rotate-12 text-2xl text-[#e8adbd]">
        ♡
      </span>

      <span className="absolute bottom-10 left-[20%] text-lg text-[#e8adbd]">
        ✿
      </span>

      <span className="absolute bottom-14 right-[20%] text-sm text-[#e2a1b3]">
        ✨
      </span>

      {/* illustration */}
      <div className="relative mx-auto mb-7 flex h-28 w-28 items-center justify-center rounded-[35px] bg-[#fde5eb] text-6xl shadow-[0_12px_30px_rgba(217,107,135,0.10)]">
        📚
        <span className="absolute -right-3 -top-4 text-2xl">🎀</span>
      </div>

      <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[#d96b87]">
        a very empty shelf
      </p>

      <h3 className="font-serif text-3xl">Nothing here... yet ♡</h3>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#49373d]/40">
        Every bookshelf starts with one story. What&apos;s the first one you're
        bringing home?
      </p>

      <button
        onClick={onAdd}
        className="mt-7 rounded-full bg-[#d96b87] px-6 py-3 text-sm font-medium text-white shadow-[0_7px_20px_rgba(217,107,135,0.20)] transition hover:-translate-y-0.5 hover:bg-[#c95778]">
        📖 Bring home a book
      </button>
    </div>
  );
}
