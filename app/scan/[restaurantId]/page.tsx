import { Suspense } from "react";
import { ScanClaim } from "@/app/components/scan/ScanClaim";

export const metadata = { title: "Checking in", robots: { index: false } };

export default async function ScanPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;
  return (
    <Suspense fallback={null}>
      <ScanClaim restaurantId={restaurantId} />
    </Suspense>
  );
}
