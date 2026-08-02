import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Still Frames — Fujifilm Photo Gallery",
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
    title: "Still Frames — Fujifilm Photo Gallery",
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
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
