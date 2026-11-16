import type { Metadata } from "next";
import { Lobster, Nunito } from "next/font/google";
import Snowfall from "@/components/Snowfall";
import "./globals.css";

// Lobster has Cyrillic letters, so headings render properly in Bulgarian.
const display = Lobster({
  variable: "--font-christmas",
  weight: ["400"],
  subsets: ["latin", "cyrillic"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Таен Дядо Коледа",
  description: "Теглене на имена, списъци с желания и разкриване на кого подаряваш.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bg" className={`${display.variable} ${nunito.variable}`}>
      <body className="min-h-dvh antialiased">
        <Snowfall />
        <div className="relative">{children}</div>
      </body>
    </html>
  );
}
