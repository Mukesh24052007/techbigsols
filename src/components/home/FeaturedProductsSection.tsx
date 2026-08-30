"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Product } from "@/types";
import { ProductCard } from "@/components/products/ProductCard";

interface FeaturedProductsSectionProps {
  products: Product[];
}

export function FeaturedProductsSection({ products }: FeaturedProductsSectionProps) {
  return (
    <section className="py-20 bg-surface-container-low border-y border-slate-200/60" id="products">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-action-orange/10 text-action-orange rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              Certified Hardware
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-primary">
              Featured Products
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-1">
              Top-tier hardware and smart tech accessories to complement our digital solutions.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-brand-blue border-2 border-brand-blue px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-blue hover:text-white transition-all shadow-sm"
          >
            <span>View All Products</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
