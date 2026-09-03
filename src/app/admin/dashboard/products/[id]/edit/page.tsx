"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminProducts } from "@/context/AdminProductsContext";
import { useToast } from "@/context/ToastContext";
import { ProductForm } from "@/components/admin/ProductForm";
import { Product } from "@/types";
import {
  fetchProduct,
  updateProductRequest,
  extractApiError,
} from "@/lib/api/products";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const { updateProduct } = useAdminProducts();
  const { showToast } = useToast();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch directly from the API so the page works on hard refresh
  // (context may not be populated yet).
  // GET /api/products/:id
  useEffect(() => {
    fetchProduct(params.id)
      .then(setProduct)
      .catch(() => setLoadError(true));
  }, [params.id]);

  const handleSubmit = async (updated: Product) => {
    setSaving(true);
    try {
      // PUT /api/products/:id — sends full product body, merges on the server
      const saved = await updateProductRequest(updated);
      // Update in-memory context so the list reflects the change immediately
      updateProduct(saved);
      showToast(`"${saved.name}" updated successfully.`, "success");
      // router.refresh() invalidates Next.js router cache so the products list
      // page re-renders with fresh data instead of showing stale state.
      router.refresh();
      router.push("/admin/dashboard/products");
    } catch (err) {
      showToast(
        extractApiError(err, "Failed to update product. Please try again."),
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (!product && !loadError) {
    return (
      <div className="flex items-center justify-center py-24">
        <svg
          className="animate-spin w-7 h-7 text-[#004aad]"
          fill="none"
          viewBox="0 0 24 24"
          aria-label="Loading"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
      </div>
    );
  }

  // Not found / fetch error
  if (loadError || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-3">
        <p className="text-base font-semibold text-slate-700">
          Product not found
        </p>
        <p className="text-sm">
          The product you&apos;re trying to edit doesn&apos;t exist.
        </p>
        <button
          onClick={() => router.push("/admin/dashboard/products")}
          className="mt-2 px-4 py-2 bg-[#004aad] text-white rounded-xl text-sm font-semibold"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800">Edit Product</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Editing:{" "}
          <span className="font-medium text-slate-700">{product.name}</span>
        </p>
      </div>
      <ProductForm
        initial={product}
        onSubmit={handleSubmit}
        submitLabel={saving ? "Saving…" : "Save Changes"}
        isEdit
      />
    </div>
  );
}
