"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminProducts } from "@/context/AdminProductsContext";
import { useToast } from "@/context/ToastContext";
import { ProductForm } from "@/components/admin/ProductForm";
import { Product } from "@/types";
import { createProductRequest, extractApiError } from "@/lib/api/products";

export default function NewProductPage() {
  const { addProduct } = useAdminProducts();
  const { showToast } = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (product: Product) => {
    setSaving(true);
    try {
      // POST /api/products — sends { name, short_description, full_description,
      // specifications: [{key,value}], image_url, price, category, badge,
      // rating, in_stock }
      const created = await createProductRequest(product);
      addProduct(created);
      showToast(`"${created.name}" added successfully.`, "success");
      router.push("/admin/dashboard/products");
    } catch (err) {
      showToast(
        extractApiError(err, "Failed to add product. Please try again."),
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800">Add New Product</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Fill in the details below to add a product to the catalog.
        </p>
      </div>
      <ProductForm
        onSubmit={handleSubmit}
        submitLabel={saving ? "Saving…" : "Add Product"}
      />
    </div>
  );
}
