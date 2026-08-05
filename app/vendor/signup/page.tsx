import { VendorShell } from "@/app/components/vendor/VendorShell";
import { VendorSignup } from "@/app/components/vendor/VendorSignup";

export const metadata = { title: "Claim your restaurant" };

export default function VendorSignupPage() {
  return (
    <VendorShell>
      <VendorSignup />
    </VendorShell>
  );
}
