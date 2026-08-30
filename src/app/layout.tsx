import type { Metadata } from "next";
import { Hanken_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import { CartProvider } from "@/context/CartContext";
import { QuoteModalProvider } from "@/context/QuoteModalContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { QuoteModal } from "@/components/ui/QuoteModal";

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

export const metadata: Metadata = {
  title: "TechBigSolutions - Empowering Businesses Through Innovative Solutions",
  description: "Enterprise IT Infrastructure, Recruitment & HR Services, Corporate Training, Business Consulting, and Hardware Solutions.",
  keywords: "TechBigSolutions, IT Services, Enterprise Hardware, Recruitment HR, Corporate Training, Business Consulting, Bangalore Tech",
  openGraph: {
    title: "TechBigSolutions | Precision Technology & Consulting",
    description: "Robust technology frameworks and strategic consulting to drive your enterprise forward.",
    url: "https://techbigsolutions.in",
    siteName: "TechBigSolutions",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${hankenGrotesk.variable} ${inter.variable} scroll-smooth`}>
      <body className="font-body min-h-screen flex flex-col antialiased bg-surface text-on-surface selection:bg-brand-blue selection:text-white">
        <ToastProvider>
          <CartProvider>
            <QuoteModalProvider>
              <Navbar />
              <div className="flex-1 flex flex-col w-full">{children}</div>
              <Footer />
              <CartDrawer />
              <QuoteModal />
            </QuoteModalProvider>
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
