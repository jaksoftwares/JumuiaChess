import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://jumuiyachess.org'),
  title: {
    default: "Jumuiya Chess | Transforming Lives Globally",
    template: "%s | Jumuiya Chess",
  },
  description: "Transforming lives globally through the power of chess. We distribute chess boards, organize local tournaments, and foster communities in Africa and beyond.",
  keywords: ["Chess", "Jumuiya Chess", "Chess Tournaments", "Chess in Kenya", "African Chess", "Chess Charity", "Chess Community"],
  authors: [{ name: "Jumuiya Chess Foundation" }],
  creator: "Jumuiya Chess Foundation",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://jumuiyachess.org",
    title: "Jumuiya Chess | Transforming Lives Globally",
    description: "Transforming lives globally through the power of chess. We distribute chess boards, organize local tournaments, and foster communities.",
    siteName: "Jumuiya Chess",
    images: [
      {
        url: "/images/og-default.jpg", 
        width: 1200,
        height: 630,
        alt: "Jumuiya Chess - Transforming Lives",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jumuiya Chess | Transforming Lives Globally",
    description: "Transforming lives globally through the power of chess.",
    images: ["/images/og-default.jpg"],
    creator: "@jumuiyachess",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { SettingsProvider } from "@/components/providers/SettingsProvider";
import NextTopLoader from 'nextjs-toploader';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} scroll-smooth`}>
      <body className="antialiased bg-offwhite text-charcoal min-h-screen flex flex-col print:block print:min-h-0">
        <SettingsProvider>
          <NextTopLoader color="#6B4A34" showSpinner={false} />
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
