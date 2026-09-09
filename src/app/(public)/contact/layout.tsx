import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — Get in Touch With Our Enterprise Team",
  description:
    "Contact TechBigSolutions for IT services, SAP training, hardware procurement, or recruitment. Our team at Bangalore responds within 2 hours. Call, email, or submit an inquiry.",
  alternates: {
    canonical: "https://techbigsolutions.in/contact",
  },
  openGraph: {
    title: "Contact TechBigSolutions — Bangalore IT Services",
    description:
      "Reach our solution architects, hardware procurement desk, and 24/7 technical helpdesk. We respond to all inquiries within 2 hours.",
    url: "https://techbigsolutions.in/contact",
    images: [
      {
        url: "/og-contact.jpg",
        width: 1200,
        height: 630,
        alt: "TechBigSolutions contact and support",
      },
    ],
  },
  twitter: {
    title: "Contact TechBigSolutions — Bangalore IT Services",
    description:
      "Reach our solution architects, hardware procurement desk, and 24/7 technical helpdesk.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
