import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Clicks — Fujifilm Photo Gallery",
  description:
    "A curated collection of photographs shot on Fujifilm cameras. Explore film simulations, download high-resolution images, and get in touch.",
  keywords: [
    "Fujifilm",
    "photography",
    "photo gallery",
    "film simulation",
    "X-T5",
    "Classic Chrome",
    "street photography",
  ],
  openGraph: {
    title: "Clicks — Fujifilm Photo Gallery",
    description:
      "Explore a curated collection of Fujifilm photography with film simulations and full-resolution downloads.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
