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
  title: "DATA DOCK — SQL Playground",
  description: "A simple SQL playground for practicing PostgreSQL.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
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
