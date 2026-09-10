"use client";

import React, { useState, useEffect } from "react";
import { useQuoteModal } from "@/context/QuoteModalContext";
import { HeroSection } from "@/components/home/HeroSection";
import { SapTrainingSection } from "@/components/home/SapTrainingSection";
import { TechCoursesSection } from "@/components/home/TechCoursesSection";
import { HardwareServicesSection } from "@/components/home/HardwareServicesSection";
import { TravelBookingsSection } from "@/components/home/TravelBookingsSection";
import { ImportExportSection } from "@/components/home/ImportExportSection";
import { RealEstateSection } from "@/components/home/RealEstateSection";
import { MeetTheTeamSection } from "@/components/home/MeetTheTeamSection";
import { WhyChooseUsSection } from "@/components/home/WhyChooseUsSection";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
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
      <HeroSection onOpenQuoteModal={() => openQuoteModal("General Consultation")} />
      {/* Priority 1: SAP Training with all 10 modules */}
      <SapTrainingSection />
      {/* Priority 2: In-Demand Software & Tech Skills */}
      <TechCoursesSection />
      {/* Priority 3: Hardware Services & AMC from ₹500 */}
      <HardwareServicesSection />
      {/* Priority 4: Ticket Bookings (Flight, Train, Tirupati) */}
      <TravelBookingsSection />
      {/* Priority 5: Global Import / Export Logistics & Shipments */}
      <ImportExportSection />
      {/* Priority 6: Real Estate Services — Buy, Sell & Rent */}
      <RealEstateSection />
      {/* Founder & Enterprise Leadership Profile */}
      <MeetTheTeamSection />
      {/* Why Choose Us & Dual Centers */}
      <WhyChooseUsSection />
      {/* Hardware & Accessory Products */}
      {products.length > 0 && <FeaturedProductsSection products={products} />}
      {/* Real Testimonials */}
      <TestimonialsSection />
      {/* Final Action CTA Banner */}
      <CtaBannerSection onOpenQuoteModal={() => openQuoteModal("General Consultation")} />
    </main>
  );
}
