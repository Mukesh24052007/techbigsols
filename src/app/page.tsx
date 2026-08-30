"use client";

import React from "react";
import { useQuoteModal } from "@/context/QuoteModalContext";
import { productsData } from "@/data/products";
import { testimonialsData } from "@/data/services";
import { HeroSection } from "@/components/home/HeroSection";
import { CoreExpertiseSection } from "@/components/home/CoreExpertiseSection";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { WhyChooseUsSection } from "@/components/home/WhyChooseUsSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CtaBannerSection } from "@/components/home/CtaBannerSection";

export default function HomePage() {
  const { openQuoteModal } = useQuoteModal();
  const featuredProducts = productsData.slice(0, 3);

  return (
    <main className="flex-1 w-full flex flex-col">
      <HeroSection onOpenQuoteModal={openQuoteModal} />
      <CoreExpertiseSection />
      <FeaturedProductsSection products={featuredProducts} />
      <WhyChooseUsSection />
      <TestimonialsSection testimonials={testimonialsData} />
      <CtaBannerSection onOpenQuoteModal={openQuoteModal} />
    </main>
  );
}
