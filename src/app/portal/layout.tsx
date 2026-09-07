import type { Metadata } from "next";
import { UserAuthProvider } from "@/context/UserAuthContext";
import { PortalShell } from "@/components/portal/PortalShell";

export const metadata: Metadata = {
  title: "Portal — TechBigSolutions",
  description: "TechBigSolutions Internal Portal",
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserAuthProvider>
      <PortalShell>{children}</PortalShell>
    </UserAuthProvider>
  );
}
