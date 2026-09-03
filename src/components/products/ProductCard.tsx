"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Eye, Star, Check } from "lucide-react";
import { ProductQuickViewModal } from "./ProductQuickViewModal";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-outline-variant/60 overflow-hidden flex flex-col group hover:shadow-xl hover:border-brand-blue/30 transition-all duration-300 transform hover:-translate-y-1">
        {/* Image Container */}
        <div
          onClick={() => setQuickViewOpen(true)}
          className="relative h-64 bg-gradient-to-b from-surface-container-low to-white p-6 flex items-center justify-center cursor-pointer overflow-hidden"
        >
          {/* Badge */}
          {product.badge && (
            <span
              className={`absolute top-4 left-4 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm z-10 ${product.badge === "New"
                  ? "bg-brand-blue text-white"
                  : product.badge === "Best Seller"
                    ? "bg-action-orange text-white"
                    : "bg-slate-800 text-white"
                }`}
            >
              {product.badge}
            </span>
          )}

          {/* Quick View Button Hover */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewOpen(true);
            }}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 text-slate-700 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-blue hover:text-white z-10"
            title="Quick View"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Product Image */}
          <img
            src={product.image}
            alt={product.name}
            className="max-h-48 w-auto object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-md"
          />
        </div>

        {/* Content Details */}
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-brand-blue bg-primary-fixed/40 px-2.5 py-0.5 rounded-full">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{product.rating}</span>
            </div>
          </div>

          <h3
            onClick={() => setQuickViewOpen(true)}
            className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-brand-blue transition-colors cursor-pointer"
          >
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 mb-6 flex-1 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Price & Action */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Enterprise Price</span>
              <span className="text-xl font-bold font-display text-primary">
                ₹{product.price.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 shadow-sm ${added
                  ? "bg-emerald-600 text-white"
                  : "bg-action-orange hover:bg-secondary-container text-white active:scale-95"
                }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" /> Added
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={product}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}
