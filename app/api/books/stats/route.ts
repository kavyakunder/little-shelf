import { NextResponse } from "next/server";
import { readBooks } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const books = readBooks();
  const total = books.length;
  const read = books.filter((b) => b.status === "read").length;
  const reading = books.filter((b) => b.status === "reading").length;
  const wantToRead = books.filter((b) => b.status === "want-to-read").length;
  const rated = books.filter((b) => b.rating > 0);
  const avgRating =
    rated.length > 0
      ? Number((rated.reduce((sum, b) => sum + b.rating, 0) / rated.length).toFixed(2))
      : 0;

  const genreCounts: Record<string, number> = {};
  for (const b of books) {
    if (b.genre) {
      genreCounts[b.genre] = (genreCounts[b.genre] ?? 0) + 1;
    }
  }

  return NextResponse.json({ total, read, reading, wantToRead, avgRating, genreCounts });
}
