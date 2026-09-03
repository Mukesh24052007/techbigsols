"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAdminProducts } from "@/context/AdminProductsContext";
import { useToast } from "@/context/ToastContext";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  ChevronUp,
  ChevronDown,
  Filter,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Product } from "@/types";
import { deleteProductRequest } from "@/lib/api/products";

type SortKey = "name" | "price" | "rating" | "category";
type SortDir = "asc" | "desc";

const BADGE_STYLES: Record<string, string> = {
  "New": "bg-sky-100 text-sky-700",
  "Best Seller": "bg-amber-100 text-amber-700",
  "Popular": "bg-purple-100 text-purple-700",
  "Featured": "bg-[#004aad]/10 text-[#004aad]",
};

/** Fallback style for badges that don't match the preset list */
const DEFAULT_BADGE_STYLE = "bg-slate-100 text-slate-600";

export default function AdminProductsPage() {
  const { products, loading, error, reload, deleteProduct } = useAdminProducts();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Re-fetch whenever this page is navigated to, so edits and deletions
  // from other pages are always reflected without a full browser reload.
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

  /* ── Filter + sort ─────────────────────────────────── */
  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products
    .filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let valA: string | number = a[sortKey];
      let valB: string | number = b[sortKey];
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortDir === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
    ) : (
      <ChevronUp className="w-3.5 h-3.5 opacity-20" />
    );

  /* ── Delete flow ───────────────────────────────────── */
  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteProductRequest(id);
      deleteProduct(id);
      showToast("Product deleted successfully.", "success");
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      showToast(
        (typeof msg === "string" && msg) || "Failed to delete product. Please try again.",
        "error"
      );
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Products</h2>
          <p className="text-sm text-slate-500">{products.length} total products in catalog</p>
        </div>
        <Link
          href="/admin/dashboard/products/new"
          className="inline-flex items-center gap-2 bg-[#004aad] hover:bg-[#0056cc] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-[#004aad]/25 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004aad]/25 focus:border-[#004aad] transition-all"
          />
        </div>

        {/* Category filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none bg-white border border-slate-200 rounded-xl pl-8 pr-8 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#004aad]/25 focus:border-[#004aad] transition-all cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Package className="w-12 h-12 opacity-30" />
            <p className="text-sm font-medium">No products found</p>
            <p className="text-xs">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left">
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide w-12">#</th>
                  <th
                    className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700 select-none"
                    onClick={() => toggleSort("name")}
                  >
                    <span className="flex items-center gap-1">Product <SortIcon k="name" /></span>
                  </th>
                  <th
                    className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700 select-none"
                    onClick={() => toggleSort("category")}
                  >
                    <span className="flex items-center gap-1">Category <SortIcon k="category" /></span>
                  </th>
                  <th
                    className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700 select-none"
                    onClick={() => toggleSort("price")}
                  >
                    <span className="flex items-center gap-1">Price <SortIcon k="price" /></span>
                  </th>
                  <th
                    className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700 select-none"
                    onClick={() => toggleSort("rating")}
                  >
                    <span className="flex items-center gap-1">Rating <SortIcon k="rating" /></span>
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Badge</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Stock</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((product, index) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    index={index + 1}
                    onDeleteRequest={() => setDeleteConfirm(product.id)}
                  />
                ))}
                {/* {filtered.map((product, index) => {
                  console.log(product); // Moved inside the scope
                  return (
                    <ProductRow
                      key={product.id}
                      product={product}
                      index={index + 1}
                      onDeleteRequest={() => setDeleteConfirm(product.id)}
                    />
                  );
                })} */}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results count */}
      {filtered.length > 0 && (
        <p className="text-xs text-slate-400 text-right">
          Showing {filtered.length} of {products.length} products
        </p>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-full max-w-sm">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="text-center font-bold text-slate-800 text-base mb-1">Delete Product?</h3>
            <p className="text-center text-sm text-slate-500 mb-6">
              This will remove the product from the catalog. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductRow({
  product,
  index,
  onDeleteRequest,
}: {
  product: Product;
  index: number;
  onDeleteRequest: () => void;
}) {

  console.log(product)
  return (
    <tr className="hover:bg-slate-50/70 transition-colors">
      <td className="px-5 py-3.5 text-slate-400 text-xs font-mono">{String(index).padStart(2, "0")}</td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <img
            src={product.image}
            alt={product.name}
            className="w-10 h-10 rounded-lg object-cover bg-slate-100 flex-shrink-0 border border-slate-100"
          />
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 truncate max-w-[200px]">{product.name}</p>
            <p className="text-xs text-slate-400 truncate max-w-[200px]">{product.shortDescription}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{product.category}</td>
      <td className="px-4 py-3.5 font-semibold text-slate-700">₹{Number(product.price).toFixed(2)}</td>
      <td className="px-4 py-3.5">
        <span className="flex items-center gap-1 text-amber-600 font-medium">
          ★ {Number(product.rating).toFixed(1)}
        </span>
      </td>
      <td className="px-4 py-3.5">
        {product.badge ? (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${BADGE_STYLES[product.badge!] ?? DEFAULT_BADGE_STYLE}`}>
            {product.badge}
          </span>
        ) : (
          <span className="text-slate-300 text-xs">—</span>
        )}
      </td>
      <td className="px-4 py-3.5">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.inStock ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"}`}>
          {product.inStock ? "In Stock" : "Out of Stock"}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/admin/dashboard/products/${product.id}/edit`}
            className="p-2 text-slate-400 hover:text-[#004aad] hover:bg-[#004aad]/8 rounded-lg transition-all"
            aria-label="Edit product"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <button
            onClick={onDeleteRequest}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
            aria-label="Delete product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
