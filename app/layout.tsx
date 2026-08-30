import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Little Shelf",
  description: "Track the books you've read and rate them.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
