import { MetadataRoute } from "next";
import { getAllPublishedPhotosForSitemap } from "@/lib/photos";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.stillframes.net";

  // Static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic photo pages from Supabase
  try {
    const photos = await getAllPublishedPhotosForSitemap();
    const photoRoutes: MetadataRoute.Sitemap = photos.map((photo) => ({
      url: `${baseUrl}/photo/${photo.id}`,
      lastModified: new Date(photo.created_at || Date.now()),
      changeFrequency: "weekly",
      priority: 0.8,
      images: [photo.web_image_url || photo.thumbnail_url],
    }));

    return [...routes, ...photoRoutes];
  } catch {
    return routes;
  }
}
