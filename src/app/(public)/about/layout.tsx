import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — Our Mission, Vision & Team",
  description:
    "Learn about TechBigSolutions — a Bangalore-based enterprise IT company driven by innovation, integrity, and precision engineering. Meet our team and discover our values.",
  alternates: {
    canonical: "https://techbigsolutions.in/about",
  },
  openGraph: {
    title: "About TechBigSolutions — Mission, Vision & Team",
    description:
      "We engineer scalable IT solutions, deliver SAP training, and drive enterprise growth through trusted partnerships across India.",
    url: "https://techbigsolutions.in/about",
    images: [
      {
        url: "/og-about.jpg",
        width: 1200,
        height: 630,
        alt: "TechBigSolutions team and office",
      },
    ],
  },
  twitter: {
    title: "About TechBigSolutions — Mission, Vision & Team",
    description:
      "Scalable IT solutions, SAP training, and enterprise growth through trusted partnerships.",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
