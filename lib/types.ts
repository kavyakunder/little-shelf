export type ReadStatus = "want-to-read" | "reading" | "read";

export interface Book {
  id: string;
  title: string;
  author: string;
  rating: number; // 0-5, 0 means unrated
  status: ReadStatus;
  genre?: string;
  coverUrl?: string;
  notes?: string;
  dateStarted?: string; // ISO date
  dateFinished?: string; // ISO date
  createdAt: string;
  updatedAt: string;
  readingDays?: number;
  readingDaysUnit?: "days" | "weeks" | "months" | string;
}

export type NewBookInput = Omit<Book, "id" | "createdAt" | "updatedAt">;
export type UpdateBookInput = Partial<NewBookInput>;

export interface Stats {
  total: number;
  read: number;
  reading: number;
  wantToRead: number;
  avgRating: number;
  genreCounts: Record<string, number>;
}
