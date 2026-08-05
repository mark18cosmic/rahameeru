import { VendorShell } from "@/app/components/vendor/VendorShell";
import { AdminConsole } from "@/app/components/vendor/AdminConsole";

export const metadata = { title: "Admin", robots: { index: false } };

export default function AdminPage() {
  return (
    <VendorShell>
      <AdminConsole />
    </VendorShell>
  );
}
