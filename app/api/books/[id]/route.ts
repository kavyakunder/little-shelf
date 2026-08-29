import { NextRequest, NextResponse } from "next/server";
import { readBooks, writeBooks } from "@/lib/db";
import { Book, UpdateBookInput } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Params {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const books = readBooks();
  const book = books.find((b) => b.id === params.id);
  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }
  return NextResponse.json(book);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const books = readBooks();
  const index = books.findIndex((b) => b.id === params.id);
  if (index === -1) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const updates = (await req.json()) as UpdateBookInput;
  const updated: Book = {
    ...books[index],
    ...updates,
    id: books[index].id,
    createdAt: books[index].createdAt,
    updatedAt: new Date().toISOString(),
  };

  books[index] = updated;
  writeBooks(books);

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const books = readBooks();
  const index = books.findIndex((b) => b.id === params.id);
  if (index === -1) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const [removed] = books.splice(index, 1);
  writeBooks(books);

  return NextResponse.json(removed);
}
