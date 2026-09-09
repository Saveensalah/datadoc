import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QueryNest — SQL Playground",
  description: "A browser-based SQL playground to write and execute SQL queries against an isolated PostgreSQL sandbox.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // Dark class is managed by the useDarkMode hook in page.tsx.
      // We deliberately do NOT add it here to avoid server/client mismatch.
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/*
        No manual <head> tags — metadata above is handled by Next.js
        via the Metadata API.
      */}
      <body className="h-full">{children}</body>
    </html>
  );
}
