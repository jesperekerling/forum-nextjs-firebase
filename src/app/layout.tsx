import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Forum",
  description: "School project in TypeScript class. Forum built with Next.js and Firebase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
