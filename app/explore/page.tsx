import { Suspense } from "react";
import { ExploreContent } from "@/app/components/ExploreContent";

export const metadata = {
  title: "Explore restaurants",
  description: "Browse every restaurant across Malé and Hulhumalé.",
};

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <ExploreContent />
    </Suspense>
  );
}
