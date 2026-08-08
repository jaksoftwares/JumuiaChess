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
  title: "Jumuiya Chess",
  description: "Transforming lives globally through the power of chess. We distribute chess boards, organize local tournaments, and foster communities.",
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
