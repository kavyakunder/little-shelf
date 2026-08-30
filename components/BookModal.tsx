"use client";

import { useEffect, useRef, useState } from "react";
import { Book } from "@/lib/types";
import StarRating from "./StarRating";

interface BookModalProps {
  book: Book;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const STATUS_LABEL: Record<Book["status"], string> = {
  "want-to-read": "Want to read",
  reading: "Currently reading",
  read: "Read",
};

const STATUS_COLOR: Record<Book["status"], string> = {
  "want-to-read": "bg-stone-100 text-stone-600",
  reading: "bg-clay/10 text-clay",
  read: "bg-moss/10 text-moss",
};

const PAGE_WIDTH = "min(22rem, 44vw)";
const BOOK_WIDTH = `calc(${PAGE_WIDTH} * 2)`;

const HOLD_MS = 1000;
const LEAN_MS = 1800;
const FLIP_MS = 1100;

const FLIP_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

/*
 * Delay before the page content appears.
 * The cover needs to get out of the way first.
 */
const REVEAL_DELAY_MS = 300;

type Phase = "closed" | "lean" | "open";

/*
 * These are optional because your current Book type may not
 * contain them yet.
 *
 * Once you add them to Book, you can remove the casts below.
 */
type ExtendedBook = Book & {
  review?: string;
  spoilerReview?: string;
  favoriteQuote?: string;
  takeaway?: string;
  mood?: string;
  recommendation?: boolean;
  pages?: number;
};

export default function BookModal({
  book,
  onClose,
  onEdit,
  onDelete,
}: BookModalProps) {
  const extendedBook = book as ExtendedBook;

  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>("closed");
  const [showSpoilers, setShowSpoilers] = useState(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const raf = requestAnimationFrame(() => {
      setVisible(true);
    });

    if (reduced) {
      setPhase("open");
    } else {
      timers.current.push(
        setTimeout(() => {
          setPhase("lean");
        }, HOLD_MS - LEAN_MS),
      );

      timers.current.push(
        setTimeout(() => {
          setPhase("open");
        }, HOLD_MS),
      );
    }

    return () => {
      cancelAnimationFrame(raf);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const handleClose = () => {
    setVisible(false);

    setTimeout(() => {
      onClose();
    }, 220);
  };

  const open = phase === "open";
  const leaning = phase === "lean";

  const coverRotation = open ? -180 : leaning ? -6 : 0;
  const coverLift = leaning ? 5 : 0;

  /*
   * Calculate reading duration.
   */
  const getReadingDuration = () => {
    if (!book.dateStarted || !book.dateFinished) return null;

    const start = new Date(book.dateStarted);
    const end = new Date(book.dateFinished);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return null;
    }

    const diff = end.getTime() - start.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days <= 0) return "1 day";

    return `${days} ${days === 1 ? "day" : "days"}`;
  };

  const readingDuration = getReadingDuration();

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center
        p-4 sm:p-10
        bg-ink/70 backdrop-blur-sm
        transition-opacity duration-300
        motion-reduce:transition-none
        ${visible ? "opacity-100" : "opacity-0"}`}
      onClick={handleClose}>
      {/* ==========================================================
          BACKDROP LIGHT
      ========================================================== */}

      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(" +
            "45rem 30rem at 50% 45%, " +
            "rgba(255,250,235,0.10), " +
            "transparent 70%" +
            ")",
        }}
      />

      {/* ==========================================================
          CLOSE BUTTON
      ========================================================== */}

      <button
        onClick={handleClose}
        aria-label="Close"
        className={`fixed top-6 right-6
          text-white/70 hover:text-white
          text-sm tracking-wide
          transition-opacity duration-300
          ${visible ? "opacity-100" : "opacity-0"}`}>
        Close ✕
      </button>

      {/* ==========================================================
          3D STAGE
      ========================================================== */}

      <div
        className={`transition-all duration-300 ease-out
          motion-reduce:transition-none
          ${visible ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
        style={{
          perspective: "1800px",
          width: BOOK_WIDTH,
        }}
        onClick={(e) => e.stopPropagation()}>
        <div
          className="relative"
          style={{
            width: BOOK_WIDTH,
            height: "min(34rem, 82vh)",
            transformStyle: "preserve-3d",
            transform: "rotateX(7deg)",
          }}>
          {/* ======================================================
              CONTACT SHADOW
          ====================================================== */}

          <div
            className="absolute pointer-events-none"
            style={{
              left: 0,
              bottom: "-2.2rem",
              width: BOOK_WIDTH,
              height: "2.5rem",
              background:
                "radial-gradient(" +
                "ellipse at center, " +
                "rgba(0,0,0,.42), " +
                "transparent 70%" +
                ")",
              filter: "blur(3px)",
              opacity: open ? 0.8 : 0.55,
              transition: `opacity ${FLIP_MS}ms ease`,
            }}
          />

          {/* ======================================================
              BACK COVER
          ====================================================== */}

          <div
            className="absolute pointer-events-none rounded-2xl"
            style={{
              left: 0,
              top: "5px",
              width: BOOK_WIDTH,
              height: "calc(100% - 5px)",
              background: "linear-gradient(135deg,#536653 0%,#71806d 100%)",
              opacity: open ? 1 : 0,
              transform: "translateZ(-10px)",
              transition: "opacity 450ms ease",
              zIndex: 0,
            }}
          />

          {/* ======================================================
              TWO PAGE BOOK BODY
          ====================================================== */}

          <div
            className="absolute rounded-2xl overflow-hidden bg-[#fbf7ee] shadow-2xl"
            style={{
              display: open ? "flex" : "none",
              left: 0,
              top: 0,
              width: BOOK_WIDTH,
              height: "100%",
              transformStyle: "preserve-3d",
              //   zIndex: 1,
              zIndex: 35,
            }}>
            {/* ====================================================
                LEFT PAGE
            ==================================================== */}

            <div
              className="absolute left-0 top-0 h-full flex flex-col p-6 sm:p-8"
              style={{
                width: PAGE_WIDTH,
                background:
                  "linear-gradient(90deg,#fbf7ee 0%,#f9f3e8 88%,#eee6d8 100%)",
                boxShadow: "inset -20px 0 25px -22px rgba(0,0,0,.55)",
              }}>
              <div
                className="flex flex-col h-full transition-opacity duration-300"
                style={{
                  opacity: open ? 1 : 0,
                  transitionDelay: open ? `${REVEAL_DELAY_MS}ms` : "0ms",
                }}>
                {/* Small label */}

                <p
                  className="text-[10px] uppercase tracking-[0.22em]
                    text-ink/35 mb-4">
                  A book from your shelf
                </p>

                {/* Title */}

                <h2
                  className="font-serif text-3xl sm:text-4xl
                    text-ink leading-tight">
                  {book.title}
                </h2>

                {/* Author */}

                <p className="mt-2 text-base text-ink/55">by {book.author}</p>

                {/* Genre */}

                {book.genre && (
                  <span
                    className="self-start mt-4
                      text-[11px]
                      px-3 py-1
                      rounded-full
                      bg-stone-100
                      text-stone-600">
                    {book.genre}
                  </span>
                )}

                {/* Divider */}

                <div className="h-px bg-ink/10 my-6" />

                {/* Rating */}

                <div>
                  <p
                    className="text-[10px]
                      uppercase
                      tracking-[0.18em]
                      text-ink/35
                      mb-2">
                    Your rating
                  </p>

                  <div className="flex items-center gap-3">
                    <StarRating value={book.rating} />

                    <span className="text-sm text-ink/50">{book.rating}/5</span>
                  </div>
                </div>

                {/* Status */}

                <div className="mt-5">
                  <p
                    className="text-[10px]
                      uppercase
                      tracking-[0.18em]
                      text-ink/35
                      mb-2">
                    Status
                  </p>

                  <span
                    className={`inline-flex
                      text-xs
                      font-medium
                      px-3 py-1.5
                      rounded-full
                      ${STATUS_COLOR[book.status]}`}>
                    {book.status === "read" && "✓ "}
                    {STATUS_LABEL[book.status]}
                  </span>
                </div>

                {/* Reading dates */}

                {(book.dateStarted || book.dateFinished || readingDuration) && (
                  <div className="mt-6">
                    <p
                      className="text-[10px]
                        uppercase
                        tracking-[0.18em]
                        text-ink/35
                        mb-3">
                      Your reading journey
                    </p>

                    <div className="space-y-3 text-sm text-ink/60">
                      {book.dateStarted && (
                        <div className="flex justify-between gap-4">
                          <span>Started</span>
                          <span className="text-ink font-medium">
                            {book.dateStarted}
                          </span>
                        </div>
                      )}

                      {book.dateFinished && (
                        <div className="flex justify-between gap-4">
                          <span>Finished</span>
                          <span className="text-ink font-medium">
                            {book.dateFinished}
                          </span>
                        </div>
                      )}

                      {readingDuration && (
                        <div className="flex justify-between gap-4">
                          <span>Reading time</span>
                          <span className="text-ink font-medium">
                            {readingDuration}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Recommendation */}

                {typeof extendedBook.recommendation === "boolean" && (
                  <div className="mt-6">
                    <p
                      className="text-[10px]
                        uppercase
                        tracking-[0.18em]
                        text-ink/35
                        mb-2">
                      Would you recommend it?
                    </p>

                    <p className="font-serif text-lg text-ink">
                      {extendedBook.recommendation
                        ? "💗 Definitely"
                        : "Not really"}
                    </p>
                  </div>
                )}

                {/* Bottom actions */}

                <div className="mt-auto pt-6 flex gap-2">
                  <button
                    onClick={onEdit}
                    className="flex-1
                      text-sm
                      px-3 py-2
                      rounded-lg
                      border border-stone-300
                      text-ink
                      hover:bg-white
                      transition-colors">
                    Edit
                  </button>

                  <button
                    onClick={onDelete}
                    className="flex-1
                      text-sm
                      px-3 py-2
                      rounded-lg
                      border border-red-200
                      text-red-500
                      hover:bg-red-50
                      transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {/* ====================================================
                RIGHT PAGE
            ==================================================== */}

            <div
              className="absolute top-0 h-full flex flex-col
                p-6 sm:p-8 overflow-y-auto"
              style={{
                left: PAGE_WIDTH,
                width: PAGE_WIDTH,
                opacity: open ? 1 : 0,
                transition: "opacity 500ms ease",
                transitionDelay: open ? `${REVEAL_DELAY_MS}ms` : "0ms",
                background:
                  "linear-gradient(90deg,#eee6d8 0%,#f9f3e8 8%,#fbf7ee 100%)",
                backgroundImage:
                  "repeating-linear-gradient(" +
                  "180deg," +
                  "transparent 0px," +
                  "transparent 27px," +
                  "rgba(0,0,0,.045) 28px" +
                  ")",
                boxShadow: "inset 18px 0 25px -22px rgba(0,0,0,.55)",
              }}>
              {/* ==================================================
                  RIGHT PAGE HEADER
              ================================================== */}

              <div className="flex items-center justify-between mb-5">
                <div>
                  <p
                    className="text-[10px]
                      uppercase
                      tracking-[0.2em]
                      text-ink/35">
                    After reading
                  </p>

                  <h3 className="font-serif text-2xl text-ink">
                    Your thoughts
                  </h3>
                </div>

                <span className="text-xl">✍️</span>
              </div>

              {/* ==================================================
                  NO SPOILER REVIEW
              ================================================== */}

              <section>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">💭</span>

                  <p
                    className="text-[10px]
                      uppercase
                      tracking-[0.18em]
                      text-ink/45">
                    No-spoiler review
                  </p>
                </div>

                {extendedBook.review ? (
                  <p
                    className="font-serif
                      italic
                      text-[15px]
                      text-ink/80
                      leading-7">
                    “{extendedBook.review}”
                  </p>
                ) : (
                  <p className="text-sm text-ink/35 leading-6">
                    You haven't written your spoiler-free review yet.
                  </p>
                )}
              </section>

              {/* ==================================================
                  RECOMMENDATION + MOOD
              ================================================== */}

              {(extendedBook.mood ||
                typeof extendedBook.recommendation === "boolean") && (
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {extendedBook.mood && (
                    <div
                      className="rounded-xl
                        bg-white/50
                        border border-ink/5
                        p-3">
                      <p
                        className="text-[9px]
                          uppercase
                          tracking-wider
                          text-ink/35">
                        Book mood
                      </p>

                      <p className="mt-1 text-sm text-ink">
                        {extendedBook.mood}
                      </p>
                    </div>
                  )}

                  {typeof extendedBook.recommendation === "boolean" && (
                    <div
                      className="rounded-xl
                        bg-white/50
                        border border-ink/5
                        p-3">
                      <p
                        className="text-[9px]
                          uppercase
                          tracking-wider
                          text-ink/35">
                        Recommend
                      </p>

                      <p className="mt-1 text-sm text-ink">
                        {extendedBook.recommendation ? "💗 Yes" : "Maybe not"}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ==================================================
                  FAVORITE QUOTE
              ================================================== */}

              {extendedBook.favoriteQuote && (
                <section className="mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">❝</span>

                    <p
                      className="text-[10px]
                        uppercase
                        tracking-[0.18em]
                        text-ink/45">
                      Favorite quote
                    </p>
                  </div>

                  <div
                    className="rounded-xl
                      bg-white/45
                      border border-ink/5
                      p-4">
                    <p
                      className="font-serif
                        text-sm
                        italic
                        leading-6
                        text-ink/75">
                      “{extendedBook.favoriteQuote}”
                    </p>
                  </div>
                </section>
              )}

              {/* ==================================================
                  BIGGEST TAKEAWAY
              ================================================== */}

              {extendedBook.takeaway && (
                <section className="mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">🌱</span>

                    <p
                      className="text-[10px]
                        uppercase
                        tracking-[0.18em]
                        text-ink/45">
                      Biggest takeaway
                    </p>
                  </div>

                  <p
                    className="text-sm
                      leading-6
                      text-ink/70">
                    {extendedBook.takeaway}
                  </p>
                </section>
              )}

              {/* ==================================================
                  SPOILER ROOM
              ================================================== */}

              <section className="mt-7">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm">🔐</span>

                  <p
                    className="text-[10px]
                      uppercase
                      tracking-[0.18em]
                      text-ink/45">
                    Spoiler room
                  </p>
                </div>

                {!showSpoilers ? (
                  <button
                    onClick={() => setShowSpoilers(true)}
                    className="w-full
                      rounded-xl
                      border border-dashed
                      border-ink/15
                      bg-white/30
                      p-5
                      text-left
                      hover:bg-white/50
                      transition-all
                      group">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10
                          rounded-full
                          bg-ink/5
                          flex items-center
                          justify-center
                          text-lg
                          group-hover:scale-105
                          transition-transform">
                        🔒
                      </div>

                      <div>
                        <p className="text-sm font-medium text-ink">
                          Keep the secrets hidden
                        </p>

                        <p className="text-xs text-ink/40 mt-1">
                          Tap to reveal your spoiler thoughts
                        </p>
                      </div>
                    </div>
                  </button>
                ) : (
                  <div
                    className="rounded-xl
                      border border-red-200/60
                      bg-red-50/30
                      p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p
                        className="text-[9px]
                          uppercase
                          tracking-[0.18em]
                          text-red-400">
                        ⚠ Spoilers ahead
                      </p>

                      <button
                        onClick={() => setShowSpoilers(false)}
                        className="text-[10px]
                          text-ink/35
                          hover:text-ink">
                        Hide
                      </button>
                    </div>

                    {extendedBook.spoilerReview ? (
                      <p
                        className="font-serif
                          text-sm
                          leading-6
                          text-ink/75">
                        {extendedBook.spoilerReview}
                      </p>
                    ) : (
                      <p className="text-sm text-ink/35">
                        No spoiler review written yet.
                      </p>
                    )}
                  </div>
                )}
              </section>

              {/* ==================================================
                  EMPTY STATE
              ================================================== */}

              {!extendedBook.review &&
                !extendedBook.favoriteQuote &&
                !extendedBook.takeaway &&
                !extendedBook.spoilerReview && (
                  <div
                    className="mt-6
                      rounded-xl
                      border border-dashed
                      border-ink/10
                      p-5
                      text-center">
                    <p className="text-2xl mb-2">📖</p>

                    <p className="font-serif text-sm text-ink/60">
                      This page is still waiting for your thoughts.
                    </p>

                    <button
                      onClick={onEdit}
                      className="mt-3
                        text-xs
                        text-clay
                        hover:underline">
                      Write something →
                    </button>
                  </div>
                )}
            </div>

            {/* ====================================================
                REAL SPINE
            ==================================================== */}

            <div
              className="absolute
                top-0 bottom-0
                pointer-events-none
                z-20"
              style={{
                left: `calc(${PAGE_WIDTH} - 13px)`,
                width: "26px",
                opacity: open ? 1 : 0,
                transition: `opacity 450ms ease ${
                  open ? REVEAL_DELAY_MS : 0
                }ms`,
                background:
                  "linear-gradient(" +
                  "90deg," +
                  "transparent," +
                  "rgba(0,0,0,.07) 20%," +
                  "rgba(0,0,0,.22) 50%," +
                  "rgba(0,0,0,.07) 80%," +
                  "transparent" +
                  ")",
              }}
            />
          </div>

          {/* ======================================================
              COVER SHADOW
          ====================================================== */}

          <div
            className="absolute pointer-events-none"
            style={{
              left: PAGE_WIDTH,
              top: 0,
              width: PAGE_WIDTH,
              height: "100%",
              transformOrigin: "left center",
              transform: `
                translateZ(-5px)
                rotateY(${coverRotation}deg)
              `,
              transition: `transform ${open ? FLIP_MS : LEAN_MS}ms ${
                open ? FLIP_EASE : "cubic-bezier(.4,0,.2,1)"
              }`,
              background:
                "linear-gradient(90deg,rgba(0,0,0,.30),rgba(0,0,0,.08) 45%,transparent)",
              filter: "blur(7px)",
              opacity: open ? 0.28 : 0.5,
              zIndex: 3,
            }}
          />

          {/* ======================================================
              FRONT COVER
          ====================================================== */}

          <div
            className="absolute rounded-2xl z-30"
            style={{
              left: PAGE_WIDTH,
              top: 0,
              width: PAGE_WIDTH,
              height: "100%",
              transformOrigin: "left center",
              transform: `
                translateZ(${coverLift}px)
                rotateY(${coverRotation}deg)
              `,
              transformStyle: "preserve-3d",
              transition: `transform ${open ? FLIP_MS : LEAN_MS}ms ${
                open ? FLIP_EASE : "cubic-bezier(.4,0,.2,1)"
              }`,
              backfaceVisibility: "hidden",
              boxShadow: open
                ? "none"
                : leaning
                  ? "0 18px 35px rgba(0,0,0,.32)"
                  : "0 12px 30px rgba(0,0,0,.34)",
            }}>
            {/* ==================================================
                COVER FRONT
            ================================================== */}

            <div
              className="absolute
                inset-0
                rounded-r-lg
                overflow-hidden"
              style={{
                backfaceVisibility: "hidden",
              }}>
              {book.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full
                    flex items-center
                    justify-center
                    bg-gradient-to-br
                    from-moss
                    to-moss/70">
                  <span
                    className="font-serif
                      text-6xl
                      text-white/30">
                    {book.title.charAt(0)}
                  </span>
                </div>
              )}

              {/* Cover lighting */}

              <div
                className="absolute
                  inset-0
                  bg-black/10
                  pointer-events-none"
              />

              {/* Spine */}

              <div
                className="absolute
                  inset-y-0
                  left-0
                  pointer-events-none"
                style={{
                  width: "9px",
                  background:
                    "linear-gradient(90deg,rgba(0,0,0,.45),rgba(0,0,0,.12),transparent)",
                }}
              />

              {/* Outer edge */}

              <div
                className="absolute
                  inset-y-0
                  right-0
                  pointer-events-none"
                style={{
                  width: "8px",
                  background:
                    "linear-gradient(90deg,transparent,rgba(255,255,255,.15))",
                }}
              />
            </div>

            {/* ==================================================
                INSIDE OF COVER
            ================================================== */}

            <div
              className="absolute
                inset-0
                rounded-2xl
                overflow-hidden"
              style={{
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
                background: "linear-gradient(135deg,#f0e8dc,#ded1bd)",
              }}>
              <div
                className="absolute
                  inset-3
                  rounded-xl"
                style={{
                  border: "1px solid rgba(0,0,0,.05)",
                  background: "linear-gradient(135deg,#f1e9de,#ded1bd)",
                }}
              />

              <div
                className="absolute
                  inset-y-0
                  left-0"
                style={{
                  width: "18px",
                  background:
                    "linear-gradient(90deg,rgba(0,0,0,.18),transparent)",
                }}
              />
            </div>

            {/* ==================================================
                PHYSICAL SPINE
            ================================================== */}

            <div
              className="absolute
                left-0
                top-0
                bottom-0
                pointer-events-none"
              style={{
                width: "7px",
                transform: "translateZ(4px)",
                background:
                  "linear-gradient(90deg,rgba(0,0,0,.40),rgba(255,255,255,.12),transparent)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
