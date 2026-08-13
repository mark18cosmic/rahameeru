import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MobileTabBar from "./components/MobileTabBar";
import { PullToRefresh } from "./components/PullToRefresh";
import { InstallPrompt } from "./components/InstallPrompt";
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
    default: "Rahameeru · Where to eat in the Maldives",
    template: "%s · Rahameeru",
  },
  description:
    "Find somewhere to eat in Malé and Hulhumalé. Menus, opening hours, honest reviews, and a wheel to spin when nobody can decide.",
  keywords: ["Maldives restaurants", "Malé food", "Hulhumalé dining", "restaurant menus"],
  appleWebApp: {
    capable: true,
    title: "Rahameeru",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "Rahameeru · Where to eat in the Maldives",
    description: "Menus, reviews and opening hours for Malé and Hulhumalé.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Deliberately not capping maximumScale — blocking zoom fails WCAG 1.4.4.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#171512" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <ThemeProvider>
          <AuthProvider>
            <SearchProvider>
              <a
                href="#content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-root-500 focus:px-5 focus:py-3 focus:text-white"
              >
                Skip to content
              </a>
              <PullToRefresh />
              <Navbar />
              {/* Bottom padding clears the mobile tab bar, which now floats
                  clear of the bottom edge and so needs its own gap too. */}
              <div id="content" className="min-h-screen pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0">
                {children}
              </div>
              <Footer />
              <MobileTabBar />
              <InstallPrompt />
            </SearchProvider>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
