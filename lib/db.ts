import booksData from "../data/books.json";
import { Book } from "./types";

export function readBooks(): Book[] {
  return booksData as Book[];
}

export function writeBooks(_books: Book[]): void {
  // No-op in this environment — see note below.
  console.warn(
    "writeBooks() called, but this deployment has no persistent storage. " +
      "The change was not saved.",
  );
}
