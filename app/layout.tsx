import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextUIProvider } from "@nextui-org/react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rahameeru | Find the best places to eat near you",
  description: "Discover the best restaurants in Malé and Hulhumalé with Rahameeru! Create an account to explore top-rated dining spots and review your favorites. Find the perfect place for every occasion—whether it’s affordable eats, luxury dining, or a romantic date night. Start exploring the Maldives' culinary scene today!w",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest"></link>
        <link rel="icon" href="/favicon.ico" />
        <meta name="google-adsense-account" content="ca-pub-3567729252312652" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3567729252312652"
          crossOrigin="anonymous"></script>
      </head>
      <body className={inter.className}>
        <NextUIProvider>
          <Navbar />
          {children}
          <Analytics />
          <Footer />
        </NextUIProvider>

      </body >
    </html >
  );
}
