import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query?.trim()) {
      return NextResponse.json(
        { error: "Search query is required." },
        { status: 400 },
      );
    }

    const googleUrl = new URL("https://www.googleapis.com/books/v1/volumes");

    googleUrl.searchParams.set("q", query);
    googleUrl.searchParams.set("maxResults", "10");

    // Optional API key
    if (process.env.GOOGLE_BOOKS_API_KEY) {
      googleUrl.searchParams.set("key", process.env.GOOGLE_BOOKS_API_KEY);
    }

    const response = await fetch(googleUrl.toString(), {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Google Books request failed.");
    }

    const data = await response.json();

    const books = (data.items ?? []).map((item: any) => {
      const info = item.volumeInfo ?? {};

      const identifiers = info.industryIdentifiers ?? [];

      const isbn13 = identifiers.find(
        (item: any) => item.type === "ISBN_13",
      )?.identifier;

      const isbn10 = identifiers.find(
        (item: any) => item.type === "ISBN_10",
      )?.identifier;

      return {
        id: item.id,

        title: info.title ?? "Unknown title",

        author: info.authors?.join(", ") ?? "Unknown author",

        coverUrl: info.imageLinks?.thumbnail?.replace("http://", "https://"),

        isbn: isbn13 ?? isbn10,

        description: info.description,

        pages: info.pageCount,

        publisher: info.publisher,

        genre: info.categories?.[0],
      };
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error("Google Books error:", error);

    return NextResponse.json(
      { error: "Unable to search Google Books." },
      { status: 500 },
    );
  }
}
