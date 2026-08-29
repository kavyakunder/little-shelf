import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { readBooks, writeBooks } from "@/lib/db";
import { Book, NewBookInput } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let books = readBooks();
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search");
  const status = searchParams.get("status");
  const minRating = searchParams.get("minRating");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const order = searchParams.get("order") === "asc" ? 1 : -1;

  if (search) {
    const q = search.toLowerCase();
    books = books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.genre ?? "").toLowerCase().includes(q)
    );
  }

  if (status) {
    books = books.filter((b) => b.status === status);
  }

  if (minRating) {
    const min = Number(minRating);
    if (!Number.isNaN(min)) {
      books = books.filter((b) => b.rating >= min);
    }
  }

  books.sort((a: any, b: any) => {
    const av = a[sortBy] ?? "";
    const bv = b[sortBy] ?? "";
    if (av < bv) return -1 * order;
    if (av > bv) return 1 * order;
    return 0;
  });

  return NextResponse.json(books);
}

export async function POST(req: NextRequest) {
  const input = (await req.json()) as NewBookInput;

  if (!input.title || !input.author) {
    return NextResponse.json({ error: "Title and author are required" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const newBook: Book = {
    id: uuidv4(),
    title: input.title,
    author: input.author,
    rating: typeof input.rating === "number" ? input.rating : 0,
    status: input.status ?? "want-to-read",
    genre: input.genre,
    coverUrl: input.coverUrl,
    notes: input.notes,
    dateStarted: input.dateStarted,
    dateFinished: input.dateFinished,
    createdAt: now,
    updatedAt: now,
  };

  const books = readBooks();
  books.push(newBook);
  writeBooks(books);

  return NextResponse.json(newBook, { status: 201 });
}
