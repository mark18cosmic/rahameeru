import type { Metadata } from "next";
import { getRestaurantBySlug } from "@/app/lib/restaurants";
import { seedRestaurants } from "@/app/lib/data";
import { RestaurantLoader } from "@/app/components/restaurant/RestaurantLoader";

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
    description: r.description || `Discover ${r.name} on Rahameeru.`,
    openGraph: { images: [r.image], title: r.name, description: r.description },
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
