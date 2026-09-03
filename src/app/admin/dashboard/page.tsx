"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useAdminProducts } from "@/context/AdminProductsContext";
import {
  Package,
  Tag,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function DashboardHomePage() {
  const { products, loading, error, reload } = useAdminProducts();

  // Re-fetch on every mount so stock counts and status badges
  // always reflect the latest data without a full browser reload.
  useEffect(() => {
    reload();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <svg className="animate-spin w-7 h-7 text-[#004aad]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-rose-600" />
        </div>
        <p className="text-base font-semibold text-slate-800">Failed to load products</p>
        <p className="text-sm text-slate-500 max-w-sm text-center">{error}</p>
        <button
          onClick={reload}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#004aad] text-white rounded-xl text-sm font-semibold"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  const total = products.length;
  const inStock = products.filter((p) => p.inStock).length;
  const categories = [...new Set(products.map((p) => p.category))].length;
  const badged = products.filter((p) => p.badge).length;

  const stats = [
    {
      label: "Total Products",
      value: total,
      icon: Package,
      color: "bg-[#004aad]/10 text-[#004aad]",
      border: "border-[#004aad]/20",
    },
    {
      label: "In Stock",
      value: inStock,
      icon: CheckCircle2,
      color: "bg-emerald-500/10 text-emerald-600",
      border: "border-emerald-500/20",
    },
    {
      label: "Categories",
      value: categories,
      icon: Tag,
      color: "bg-[#f39200]/10 text-[#f39200]",
      border: "border-[#f39200]/20",
    },
    {
      label: "Badged Items",
      value: badged,
      icon: TrendingUp,
      color: "bg-purple-500/10 text-purple-600",
      border: "border-purple-500/20",
    },
  ];

  const recent = products.slice(0, 5);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome */}
      {/* <div>
        <h2 className="text-xl font-bold text-slate-800">Welcome back, Admin 👋</h2>
        <p className="text-sm text-slate-500 mt-0.5">Here's a quick overview of your product catalog.</p>
      </div> */}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, border }) => (
          <div
            key={label}
            className={`bg-white rounded-2xl border ${border} p-5 flex flex-col gap-3 shadow-sm`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent products table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm">Recent Products</h3>
          <Link
            href="/admin/dashboard/products"
            className="flex items-center gap-1 text-xs font-medium text-[#004aad] hover:underline"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Product</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Price</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recent.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-3.5 flex items-center gap-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-9 h-9 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                    />
                    <span className="font-medium text-slate-800 truncate max-w-[180px]">{p.name}</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">{p.category}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-700">₹{Number(p.price).toFixed(2)}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        p.inStock
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-600"
                      }`}
                    >
                      {p.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
