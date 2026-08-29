import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shelf — My Reading Log",
  description: "Track the books you've read and rate them.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
