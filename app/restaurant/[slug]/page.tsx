import type { Metadata } from "next";
import { getRestaurantBySlug } from "@/app/lib/restaurants";
import { seedRestaurants } from "@/app/lib/data";
import { RestaurantLoader } from "@/app/components/restaurant/RestaurantLoader";
import { photoUrl } from "@/app/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const r = await getRestaurantBySlug(slug);
  if (!r) return { title: "Restaurant not found" };
  return {
    title: r.name,
    description:
      r.description || `${r.name} — menu, hours and reviews on Rahameeru.`,
    openGraph: {
      images: [photoUrl(r)],
      title: r.name,
      description: r.description,
    },
  };
}

// Pre-render the seed restaurants; others render on demand.
export function generateStaticParams() {
  return seedRestaurants.map((r) => ({ slug: r.slug }));
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <RestaurantLoader slug={slug} />;
}
