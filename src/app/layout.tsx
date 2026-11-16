import type { Metadata } from "next";
import { Mountains_of_Christmas, Nunito } from "next/font/google";
import Snowfall from "@/components/Snowfall";
import "./globals.css";

const christmas = Mountains_of_Christmas({
  variable: "--font-christmas",
  weight: ["700"],
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Secret Santa",
  description: "Draw names, write wishlists, and find out who you're buying for.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${christmas.variable} ${nunito.variable}`}>
      <body className="min-h-dvh antialiased">
        <Snowfall />
        <div className="relative">{children}</div>
      </body>
    </html>
  );
}
