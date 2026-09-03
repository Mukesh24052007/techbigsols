"use client";

import React, { useState, useEffect } from "react";
import { useQuoteModal } from "@/context/QuoteModalContext";
import { testimonialsData } from "@/data/services";
import { HeroSection } from "@/components/home/HeroSection";
import { CoreExpertiseSection } from "@/components/home/CoreExpertiseSection";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { WhyChooseUsSection } from "@/components/home/WhyChooseUsSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { MeetTheTeamSection } from "@/components/home/MeetTheTeamSection";
import { CtaBannerSection } from "@/components/home/CtaBannerSection";
import { fetchProducts } from "@/lib/api/products";
import type { Product } from "@/types";

export default function HomePage() {
  const { openQuoteModal } = useQuoteModal();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts()
      .then((data) => {
        // Prefer products with badge or highest rating
        const featured = data.filter((p) => p.badge || p.rating >= 4.8);
        setProducts(featured.length >= 3 ? featured.slice(0, 3) : data.slice(0, 3));
      })
      .catch((err) => {
        console.error("Failed to load featured products:", err);
      });
  }, []);

  return (
    <main className="flex-1 w-full flex flex-col">
      <HeroSection onOpenQuoteModal={openQuoteModal} />
      <CoreExpertiseSection />
      <FeaturedProductsSection products={products} />
      <WhyChooseUsSection />
      <MeetTheTeamSection />
      <TestimonialsSection testimonials={testimonialsData} />
      <CtaBannerSection onOpenQuoteModal={openQuoteModal} />
    </main>
  );
}
