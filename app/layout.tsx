import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./providers/AuthProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { SearchProvider } from "./providers/SearchProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rahameeru.com"),
  title: {
    default: "Rahameeru · Find the best places to eat in the Maldives",
    template: "%s · Rahameeru",
  },
  description:
    "Discover top-rated restaurants across Malé and Hulhumalé. Read honest reviews, save favourites, spin the wheel to decide where to eat, and search smarter.",
  keywords: ["Maldives restaurants", "Malé food", "Hulhumalé dining", "food reviews"],
  openGraph: {
    title: "Rahameeru · The Maldives' food review guide",
    description: "Discover, review and decide where to eat in the Maldives.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <ThemeProvider>
          <AuthProvider>
            <SearchProvider>
              <Navbar />
              <div className="min-h-screen">{children}</div>
              <Footer />
            </SearchProvider>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
