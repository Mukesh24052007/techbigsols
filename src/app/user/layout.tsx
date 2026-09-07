import type { Metadata } from "next";
import { UserAuthProvider } from "@/context/UserAuthContext";

export const metadata: Metadata = {
  title: "User Portal — TechBigSolutions",
  description: "TechBigSolutions User Portal",
  robots: { index: false, follow: false },
};

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <UserAuthProvider>{children}</UserAuthProvider>;
}
