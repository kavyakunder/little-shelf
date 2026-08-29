# 📚 Shelf — Personal Book Tracker (Next.js)

A single full-stack TypeScript app — the frontend and the "backend" both live in one Next.js
project. Pages are React (App Router), and the API is Next.js Route Handlers under `app/api`.

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Storage:** A local JSON file (`data/books.json`) via `lib/db.ts` — no database setup required
  for local dev. See the note on deployment below.

## Features

- Add, edit, and delete books
- Star rating (0–5)
- Reading status: Want to read / Reading / Read
- Genre, cover image URL, notes/review, start & finish dates
- Search by title/author/genre, filter by status, sort by title/author/rating/date added
- Stats bar: total books, read/reading/want-to-read counts, average rating

## Project structure

```
book-tracker-next/
├── app/
│   ├── layout.tsx              root layout
│   ├── page.tsx                the whole UI (client component)
│   ├── globals.css             Tailwind entry point
│   └── api/
│       └── books/
│           ├── route.ts        GET (list/search/sort) + POST (create)
│           ├── stats/route.ts  GET aggregate stats
│           └── [id]/route.ts   GET / PUT / DELETE a single book
├── components/
│   ├── BookForm.tsx
│   ├── BookCard.tsx
│   └── StarRating.tsx
├── lib/
│   ├── db.ts                   JSON file read/write helpers (server-only)
│   ├── types.ts                shared Book/Stats types
│   └── api.ts                  client-side fetch wrapper
└── data/books.json             created automatically on first run
```

## Getting started

You'll need [Node.js](https://nodejs.org/) 18+ installed.

```bash
npm install
npm run dev
```

Open **http://localhost:3000**. That's it — one server, one port, frontend and API together.

### Production build

```bash
npm run build
npm start
```

## API reference

Base URL: `/api/books`

| Method | Endpoint            | Description                                   |
|--------|----------------------|------------------------------------------------|
| GET    | `/api/books`          | List books. Query params: `search`, `status`, `minRating`, `sortBy`, `order` |
| GET    | `/api/books/stats`     | Aggregate stats (totals, average rating, genre counts) |
| GET    | `/api/books/:id`       | Get a single book                              |
| POST   | `/api/books`           | Create a book (`title`, `author` required)     |
| PUT    | `/api/books/:id`       | Update a book                                  |
| DELETE | `/api/books/:id`       | Delete a book                                  |

## Important note on deployment

`lib/db.ts` stores data as a JSON file on disk. That works great for local development and for
self-hosting on a server with a persistent filesystem (a VPS, Docker container, Railway, Render,
Fly.io, etc.) — just make sure the `data/` directory is on a persistent volume.

**It will not work on Vercel's default (serverless) deployment**, because serverless functions
there have a read-only, ephemeral filesystem — writes will appear to succeed but won't persist
between requests. If you deploy to Vercel, swap `lib/db.ts` for a real database instead
(e.g. Vercel Postgres, Supabase, Neon, or Turso/SQLite). Every route only calls
`readBooks()` / `writeBooks()`, so `lib/db.ts` is the only file you'd need to change — the API
routes, types, and UI stay exactly the same.

## Extending this

- **Auth / multi-user:** add a `userId` field to `Book` and filter by the logged-in user
  (e.g. with NextAuth.js) in each route handler.
- **Real database:** replace `lib/db.ts`'s `readBooks`/`writeBooks` with calls to your ORM/client
  of choice (Prisma, Drizzle, the Supabase client, etc.).
