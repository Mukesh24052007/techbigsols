import type { Metadata } from "next";
import { Hanken_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const SITE_URL = "https://techbigsolutions.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TechBigSolutions — IT Services, SAP Training & Hardware | Bangalore",
    template: "%s | TechBigSolutions",
  },
  description:
    "TechBigSolutions delivers enterprise IT infrastructure, SAP end-to-end training, hardware procurement, recruitment, and corporate consulting from Bangalore.",
  keywords: [
    "TechBigSolutions",
    "IT services Bangalore",
    "SAP training Bangalore",
    "enterprise hardware",
    "IT recruitment",
    "corporate training",
    "business consulting",
    "hardware AMC",
    "import export logistics",
  ],
  authors: [{ name: "TechBigSolutions Pvt. Ltd.", url: SITE_URL }],
  creator: "TechBigSolutions Pvt. Ltd.",
  publisher: "TechBigSolutions Pvt. Ltd.",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "TechBigSolutions",
    title: "TechBigSolutions — IT Services, SAP Training & Hardware | Bangalore",
    description:
      "Enterprise IT infrastructure, SAP E2E training, hardware procurement, recruitment & corporate consulting. Serving Bangalore and pan-India.",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "TechBigSolutions — Enterprise IT & Training",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TechBigSolutions — IT Services, SAP Training & Hardware | Bangalore",
    description:
      "Enterprise IT infrastructure, SAP training, hardware procurement & consulting from Bangalore.",
    images: ["/og-default.jpg"],
    site: "@techbigsolutions",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    // Add your Search Console verification token here when available
    // google: "your-google-site-verification-token",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${hankenGrotesk.variable} ${inter.variable} scroll-smooth`}
    >
      <body className="font-body min-h-screen flex flex-col antialiased bg-surface text-on-surface selection:bg-brand-blue selection:text-white">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
