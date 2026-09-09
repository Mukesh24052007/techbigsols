import { CartProvider } from "@/context/CartContext";
import { QuoteModalProvider } from "@/context/QuoteModalContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GstinBar } from "@/components/layout/GstinBar";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { QuoteModal } from "@/components/ui/QuoteModal";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <QuoteModalProvider>
        <Navbar />
        <GstinBar />
        <div className="flex-1 flex flex-col w-full">{children}</div>
        <Footer />
        <CartDrawer />
        <QuoteModal />
      </QuoteModalProvider>
    </CartProvider>
  );
}
