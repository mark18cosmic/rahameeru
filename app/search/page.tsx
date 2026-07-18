import { Suspense } from "react";
import { SearchExperience } from "@/app/components/search/SearchExperience";

export const metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <SearchExperience />
    </Suspense>
  );
}
