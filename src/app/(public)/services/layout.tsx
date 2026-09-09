import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services — SAP Training, IT Infrastructure, Hardware AMC & More",
  description:
    "Explore TechBigSolutions' complete service catalogue: SAP E2E implementation, 10-module career training, hardware AMC from ₹500, ticket bookings, and import/export logistics in Bangalore.",
  alternates: {
    canonical: "https://techbigsolutions.in/services",
  },
  openGraph: {
    title: "TechBigSolutions Services — SAP, IT, Hardware AMC & Logistics",
    description:
      "SAP E2E implementations, 10-module IT career academy, doorstep hardware repair, travel ticketing, and global import/export — all from Ambattur, Bangalore.",
    url: "https://techbigsolutions.in/services",
    images: [
      {
        url: "/og-services.jpg",
        width: 1200,
        height: 630,
        alt: "TechBigSolutions services overview",
      },
    ],
  },
  twitter: {
    title: "TechBigSolutions Services — SAP, IT, Hardware AMC & Logistics",
    description:
      "SAP training, IT infrastructure, hardware AMC, travel tickets & import/export from Bangalore.",
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
