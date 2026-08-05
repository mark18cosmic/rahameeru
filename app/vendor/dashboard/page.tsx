import { VendorShell } from "@/app/components/vendor/VendorShell";
import { VendorDashboard } from "@/app/components/vendor/VendorDashboard";

export const metadata = { title: "Vendor dashboard" };

export default function VendorDashboardPage() {
  return (
    <VendorShell>
      <VendorDashboard />
    </VendorShell>
  );
}
