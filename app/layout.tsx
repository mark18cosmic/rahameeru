import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextUIProvider } from "@nextui-org/react";
import Navbar from "./components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RahaMeeru | Find the best places to eat near you",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <html lang="en">
      <head>
        <link rel="manifest" href="/public/manifest.json" />
      </head>
      <body className={inter.className}>
        <NextUIProvider>
          {children}
        </NextUIProvider>

      </body >
    </html >
  );
}
