"use client";

import React, { useState } from "react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { X, Star, ShoppingCart, Plus, Minus, ShieldCheck, Truck, RefreshCw } from "lucide-react";

interface ProductQuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductQuickViewModal({ product, isOpen, onClose }: ProductQuickViewModalProps) {
  const { addToCart, setIsCartOpen } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const handleAddAndClose = () => {
    addToCart(product, quantity);
    onClose();
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    onClose();
    setIsCartOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-surface-deep/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image Column */}
          <div className="bg-surface-container-low p-8 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-slate-200">
            {product.badge && (
              <span className="absolute top-4 left-4 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-blue text-white shadow-sm">
                {product.badge}
              </span>
            )}
            <img
              src={product.image}
              alt={product.name}
              className="max-h-72 w-auto object-contain drop-shadow-xl"
            />
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-600" /> Free Dispatch
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 3-Yr Warranty
              </span>
            </div>
          </div>

          {/* Product Info Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-brand-blue uppercase tracking-wider">
                  {product.category}
                </span>
                <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{product.rating}</span>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 mb-3">
                {product.name}
              </h2>

              <p className="text-2xl font-bold font-display text-primary mb-4">
                ₹{product.price.toFixed(2)}
              </p>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Specs Table */}
              <div className="bg-slate-50 rounded-xl p-3.5 mb-6 border border-slate-200/60">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Technical Specifications
                </h4>
                <div className="space-y-1.5 text-xs">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-slate-500">{key}</span>
                      <span className="font-semibold text-slate-800 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden p-0.5">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-bold text-slate-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2 text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddAndClose}
                  className="flex-1 bg-brand-blue hover:bg-primary text-white py-3 rounded-xl font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                className="w-full bg-action-orange hover:bg-secondary-container text-white py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all text-center"
              >
                Instant Order Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
