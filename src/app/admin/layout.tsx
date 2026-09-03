import type { Metadata } from "next";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { AdminProductsProvider } from "@/context/AdminProductsContext";

export const metadata: Metadata = {
  title: "Admin — TechBigSolutions",
  description: "TechBigSolutions Admin Panel",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminProductsProvider>
        {children}
      </AdminProductsProvider>
    </AdminAuthProvider>
  );
}
