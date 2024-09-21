import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Head from "next/head";
import "./globals.css";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

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
      <Head>
        <link rel="preconnect" href="https://forum-nextjs-afd91.firebaseapp.com" />
        <link rel="dns-prefetch" href="https://forum-nextjs-afd91.firebaseapp.com" />
        <link rel="dns-prefetch" href="https://apis.google.com" />
        <link rel="dns-prefetch" href="https://www.googleapis.com" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
      </Head>
      <body className={inter.className}>
        
        <Header />

        {children}
        
        <Footer />

      </body>
    </html>
  );
}
