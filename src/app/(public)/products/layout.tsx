import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products — Enterprise Hardware, Accessories & Workstation Equipment",
  description:
    "Shop TechBigSolutions' curated catalog of enterprise hardware, smart office accessories, and high-performance workstation equipment. Bulk GST invoicing available. Free express shipping.",
  alternates: {
    canonical: "https://techbigsolutions.in/products",
  },
  openGraph: {
    title: "Enterprise Products & Hardware — TechBigSolutions Store",
    description:
      "High-performance tech hardware, smart accessories, and workstation gear — tested for enterprise reliability. Bulk procurement with GST invoicing.",
    url: "https://techbigsolutions.in/products",
    images: [
      {
        url: "/og-products.jpg",
        width: 1200,
        height: 630,
        alt: "TechBigSolutions enterprise hardware and products",
      },
    ],
  },
  twitter: {
    title: "Enterprise Products & Hardware — TechBigSolutions Store",
    description:
      "Curated enterprise hardware and accessories with bulk procurement and GST invoicing.",
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
