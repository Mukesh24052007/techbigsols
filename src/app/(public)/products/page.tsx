"use client";

import React, { useState, useMemo, useEffect } from "react";
import type { Product } from "@/types";
import { ProductCard } from "@/components/products/ProductCard";
import { useQuoteModal } from "@/context/QuoteModalContext";
import { fetchProducts } from "@/lib/api/products";
import {
  Search,
  SlidersHorizontal,
  PackageCheck,
  Truck,
  ShieldCheck,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function ProductsPage() {
  const { openQuoteModal } = useQuoteModal();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("featured");

  useEffect(() => {
    fetchProducts()
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const list = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
    return list;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory =
          selectedCategory === "All" || p.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        return 0; // default featured
      });
  }, [products, searchQuery, selectedCategory, sortBy]);

  return (
    <main className="flex-1 w-full bg-surface pb-20">
      {/* Header Banner */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-surface-container-low border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-xs font-bold uppercase tracking-wider">
            Hardware & Accessories Store
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-primary">
            Enterprise Products & Accessories
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl">
            Discover our curated selection of high-performance tech hardware, smart office accessories, and workstation equipment tested for high reliability.
          </p>

          {/* Quick value badges */}
          <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-600 justify-center sm:justify-start">
            <span className="flex items-center gap-1.5 font-medium">
              <Truck className="w-4 h-4 text-brand-blue" /> Free Express Shipping
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> 3-Year Enterprise Warranty
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <PackageCheck className="w-4 h-4 text-action-orange" /> Bulk Commercial Invoicing
            </span>
          </div>
        </div>
      </section>

      {/* Main Content: Filter Controls & Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-brand-blue text-white shadow-sm"
                    : "bg-surface-container-low text-slate-600 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <SlidersHorizontal className="w-4 h-4 text-slate-400 hidden sm:block" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Loading catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
            <p className="text-lg font-bold text-slate-800">No matching products found</p>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Try adjusting your search keywords or switching category filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="px-5 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-semibold hover:bg-primary transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Enterprise Hardware Procurement Notice */}
        <div className="mt-16 bg-gradient-to-r from-surface-deep to-primary text-white p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-display font-bold">
              Looking for Bulk Enterprise Procurement?
            </h3>
            <p className="text-sm text-blue-100 max-w-xl">
              We provide custom server builds, bulk volume workstation leasing, tax-compliant GST invoicing, and dedicated logistics.
            </p>
          </div>
          <button
            onClick={() => openQuoteModal("Bulk Hardware Procurement")}
            className="whitespace-nowrap px-6 py-3.5 bg-action-orange hover:bg-secondary-container text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            <span>Request Bulk Quotation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </main>
  );
}
