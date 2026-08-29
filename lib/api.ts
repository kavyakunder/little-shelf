import { Book, NewBookInput, UpdateBookInput, Stats } from "./types";

const BASE_URL = "/api/books";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface BookQuery {
  search?: string;
  status?: string;
  minRating?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}

export async function fetchBooks(query: BookQuery = {}): Promise<Book[]> {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.minRating) params.set("minRating", String(query.minRating));
  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.order) params.set("order", query.order);

  const res = await fetch(`${BASE_URL}?${params.toString()}`, {
    cache: "no-store",
  });
  return handleResponse<Book[]>(res);
}

export async function fetchStats(): Promise<Stats> {
  const res = await fetch(`${BASE_URL}/stats`, { cache: "no-store" });
  return handleResponse<Stats>(res);
}

export async function createBook(input: NewBookInput): Promise<Book> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handleResponse<Book>(res);
}

export async function updateBook(
  id: string,
  input: UpdateBookInput,
): Promise<Book> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handleResponse<Book>(res);
}

export async function deleteBook(id: string): Promise<Book> {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  return handleResponse<Book>(res);
}

/* ----------------------------------------
   GOOGLE BOOKS
----------------------------------------- */

export interface GoogleBook {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  isbn?: string;
  description?: string;
  pages?: number;
  publisher?: string;
  genre?: string;
}

export async function searchGoogleBooks(query: string): Promise<GoogleBook[]> {
  if (!query.trim()) {
    return [];
  }

  const res = await fetch(
    `/api/google-books?q=${encodeURIComponent(query.trim())}`,
  );

  if (!res.ok) {
    throw new Error("Failed to search Google Books.");
  }

  return res.json();
}
