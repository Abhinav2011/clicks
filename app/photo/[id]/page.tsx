import type { Metadata } from "next";
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
    return { title: "Photo Not Found — Still Frames" };
  }

  const title = `${photo.title || "Fujifilm Photograph"} — Still Frames Gallery`;
  const description =
    photo.description ||
    `Shot on ${photo.camera || "Fujifilm X-T30 II"} using ${
      photo.film_simulation || "Classic Chrome"
    }. Explore full resolution details, EXIF data, and custom film simulation recipes on Still Frames.`;
  const imageUrl = photo.web_image_url || photo.thumbnail_url;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.stillframes.net";
  const canonicalUrl = `${siteUrl}/photo/${photo.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Still Frames",
      type: "article",
      authors: ["Abhinav Kumar"],
      images: [
        {
          url: imageUrl,
          width: photo.width,
          height: photo.height,
          alt: photo.title || "Fujifilm Photograph by Abhinav Kumar",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    other: {
      "pinterest-rich-pin": "true",
      "p:domain_verify": process.env.NEXT_PUBLIC_PINTEREST_VERIFY || "",
    },
  };
}

export default async function PhotoPage({ params }: PageProps) {
  const { id } = await params;
  const photo = await getPhotoById(id);

  if (!photo) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.stillframes.net";
  const copyrightYear = photo.created_at
    ? new Date(photo.created_at).getFullYear()
    : undefined;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: photo.web_image_url || photo.thumbnail_url,
    url: `${baseUrl}/photo/${photo.id}`,
    mainEntityOfPage: `${baseUrl}/photo/${photo.id}`,
    name: photo.title || "Fujifilm Photograph",
    description:
      photo.description ||
      `Photograph shot on ${photo.camera || "Fujifilm"} with ${photo.film_simulation || "film simulation"}.`,
    author: {
      "@type": "Person",
      name: "Abhinav Kumar",
    },
    creator: {
      "@type": "Person",
      name: "Abhinav Kumar",
    },
    creditText: "Abhinav Kumar / Still Frames",
    copyrightNotice: `© ${copyrightYear || "Current"} Abhinav Kumar`,
    thumbnailUrl: photo.thumbnail_url,
    exifData: [
      { "@type": "PropertyValue", name: "Camera", value: photo.camera },
      { "@type": "PropertyValue", name: "Film Simulation", value: photo.film_simulation },
      { "@type": "PropertyValue", name: "Lens", value: photo.lens },
    ].filter((item) => Boolean(item.value)),
  };

  return (
    <div className="flex flex-col min-h-screen bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <main className="flex-1 py-8 sm:py-12">
        <PhotoDetailClient photo={photo} />
      </main>

      <Footer />
    </div>
  );
}
