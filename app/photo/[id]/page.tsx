import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PhotoDetailClient from "./PhotoDetailClient";
import { getPhotoById } from "@/lib/photos";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const photo = await getPhotoById(id);

  if (!photo) {
    return { title: "Photo Not Found — Clicks" };
  }

  const title = `${photo.title || "Photograph"} — Clicks Fujifilm Gallery`;
  const description =
    photo.description ||
    `Shot on ${photo.camera || "Fujifilm"} with ${photo.film_simulation || "film simulation"}. Download full resolution on Clicks.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: [
        {
          url: photo.thumbnail_url || photo.web_image_url,
          width: photo.width,
          height: photo.height,
          alt: photo.title || "Fujifilm Photograph",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [photo.thumbnail_url || photo.web_image_url],
    },
  };
}

export default async function PhotoPage({ params }: PageProps) {
  const { id } = await params;
  const photo = await getPhotoById(id);

  if (!photo) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-paper">
      <Header />

      <main className="flex-1 py-8 sm:py-12">
        <PhotoDetailClient photo={photo} />
      </main>

      <Footer />
    </div>
  );
}
