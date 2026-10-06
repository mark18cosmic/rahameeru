import type { Metadata } from "next";
import { ListView } from "@/app/components/lists/ListView";

export const metadata: Metadata = {
  title: "A list of places",
  description: "A list of places to eat in Malé and Hulhumalé, shared on Decide.mv.",
};

export default async function ListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ListView id={id} />;
}
