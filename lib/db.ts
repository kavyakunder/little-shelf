import fs from "fs";
import path from "path";
import { Book } from "./types";

// NOTE: this is a simple file-based store meant for local development / self-hosting
// on a server with a persistent filesystem (e.g. a VPS or Docker container).
// It will NOT persist writes on serverless platforms with ephemeral/read-only
// filesystems (e.g. Vercel's default deployment). For production on serverless,
// swap this module out for a real database (Postgres, SQLite via Turso, etc.) —
// every API route only calls readBooks()/writeBooks(), so that's the only file
// you need to change.

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "books.json");

function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

export function readBooks(): Book[] {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  try {
    return JSON.parse(raw) as Book[];
  } catch {
    return [];
  }
}

export function writeBooks(books: Book[]): void {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(books, null, 2), "utf-8");
}
