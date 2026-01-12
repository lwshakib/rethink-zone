/**
 * This is the root layout for the entire Next.js application.
 * It provides the basic HTML structure, global styles, and application-wide providers (Theme, Toast).
 */

import type { Metadata } from "next";
import "./globals.css"; // Global Tailwind CSS styles
import { ThemeProvider } from "next-themes"; // library for dark/light mode switching
import { Toaster } from "@/components/ui/sonner"; // Toast notification component

/**
 * SEO metadata for the application.
 */
export const metadata: Metadata = {
  title: "Rethink Zone – Rethink how you work",
  description:
    "Rethink Zone is a modern workspace to organize, collaborate, and get deep work done.",
  icons: {
    icon: [
      {
        url: "/favicon_io/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon_io/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      { url: "/favicon_io/favicon.ico", sizes: "any", type: "image/x-icon" },
      {
        url: "/favicon_io/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/favicon_io/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: "/favicon_io/apple-touch-icon.png",
  },
  manifest: "/favicon_io/site.webmanifest",
};

/**
 * RootLayout Component
 * Wraps every page in the app.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
        <body className="antialiased font-inter">
          {/* 
            ThemeProvider manages 'dark' and 'light' classes on the body based on user preference.
            It also handles 'system' preference detection automatically.
          */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* The actual page content is injected here */}
            {children}
            {/* mounting the Toaster globally allows us to trigger notifications from anywhere */}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
  );
}
