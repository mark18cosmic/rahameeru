import type { Metadata } from "next";
import { GroupWheel } from "@/app/components/wheel/GroupWheel";

export const metadata: Metadata = {
  title: "Decide together",
  description: "Veto what you don't fancy, then spin. Everyone sees the same result.",
  // Private to whoever has the link.
  robots: { index: false, follow: false },
};

export default async function GroupWheelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GroupWheel id={id} />;
}
