import { VendorShell } from "@/app/components/vendor/VendorShell";
import { AdminHome } from "@/app/components/vendor/admin/AdminHome";

export const metadata = { title: "Admin", robots: { index: false } };

export default function AdminPage() {
  return (
    <VendorShell>
      <AdminHome />
    </VendorShell>
  );
}
