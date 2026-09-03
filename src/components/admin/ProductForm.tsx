"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
import { Plus, Trash2, Save, ArrowLeft, ImageIcon } from "lucide-react";

// Preset suggestions — user can also type a custom value
const CATEGORY_PRESETS = [
  "Accessories",
  "Electronics",
  "Hardware",
  "Office Tech",
  "Smart Devices",
];
const BADGE_PRESETS = ["New", "Best Seller", "Popular", "Featured"];

interface ProductFormProps {
  initial?: Partial<Product>;
  onSubmit: (product: Product) => void;
  submitLabel: string;
  isEdit?: boolean;
}

type SpecEntry = { key: string; value: string };

function specsToEntries(specs: Record<string, string>): SpecEntry[] {
  const entries = Object.entries(specs).map(([key, value]) => ({ key, value }));
  return entries.length > 0 ? entries : [{ key: "", value: "" }];
}

function entriesToSpecs(entries: SpecEntry[]): Record<string, string> {
  return Object.fromEntries(
    entries
      .filter((e) => e.key.trim() !== "")
      .map((e) => [e.key.trim(), e.value.trim()])
  );
}

export function ProductForm({
  initial = {},
  onSubmit,
  submitLabel,
  isEdit = false,
}: ProductFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initial.name ?? "");
  const [category, setCategory] = useState(initial.category ?? "");
  const [customCategory, setCustomCategory] = useState(
    initial.category && !CATEGORY_PRESETS.includes(initial.category)
      ? initial.category
      : ""
  );
  const [useCustomCategory, setUseCustomCategory] = useState(
    !!initial.category && !CATEGORY_PRESETS.includes(initial.category)
  );

  const [badge, setBadge] = useState(initial.badge ?? "");
  const [price, setPrice] = useState(String(initial.price ?? ""));
  const [rating, setRating] = useState(String(initial.rating ?? "4.5"));
  const [image, setImage] = useState(initial.image ?? "");
  const [shortDescription, setShortDescription] = useState(
    initial.shortDescription ?? ""
  );
  const [description, setDescription] = useState(initial.description ?? "");
  const [inStock, setInStock] = useState(initial.inStock ?? true);
  const [specs, setSpecs] = useState<SpecEntry[]>(
    specsToEntries(initial.specs ?? {})
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ── Spec helpers ──────────────────────────────────────── */
  const updateSpec = (i: number, field: "key" | "value", val: string) =>
    setSpecs((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, [field]: val } : s))
    );

  const addSpec = () => setSpecs((prev) => [...prev, { key: "", value: "" }]);

  const removeSpec = (i: number) =>
    setSpecs((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));

  /* ── Validation ────────────────────────────────────────── */
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Product name is required.";
    if (!price || isNaN(Number(price)) || Number(price) < 0)
      e.price = "Enter a valid price.";
    if (!image.trim()) e.image = "Image URL is required.";
    if (!shortDescription.trim())
      e.shortDescription = "Short description is required.";
    if (!description.trim()) e.description = "Full description is required.";
    const r = Number(rating);
    if (isNaN(r) || r < 0 || r > 5)
      e.rating = "Rating must be between 0 and 5.";
    const resolvedCategory = useCustomCategory
      ? customCategory.trim()
      : category.trim();
    if (!resolvedCategory) e.category = "Category is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Submit ────────────────────────────────────────────── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const resolvedCategory = useCustomCategory
      ? customCategory.trim()
      : category.trim();

    const product: Product = {
      id: initial.id ?? `prod-${Date.now()}`,
      name: name.trim(),
      category: resolvedCategory,
      price: Number(price),
      rating: Number(rating),
      badge: badge !== "" ? badge : undefined,
      image: image.trim(),
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      specs: entriesToSpecs(specs),
      inStock,
    };

    onSubmit(product);
  };

  /* ── Shared style helpers ──────────────────────────────── */
  const inputCls = (field: string) =>
    `w-full bg-white border ${
      errors[field]
        ? "border-rose-400 focus:ring-rose-400/30"
        : "border-slate-200 focus:ring-[#004aad]/25"
    } rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-[#004aad] transition-all`;

  const labelCls =
    "block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5";

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Back + submit row */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/admin/dashboard/products")}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 bg-[#004aad] hover:bg-[#0056cc] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-[#004aad]/30"
          >
            <Save className="w-4 h-4" />
            {submitLabel}
          </button>
        </div>

        {/* Grid: main info + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Main column ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Basic info card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm">Basic Information</h3>

              {/* Name */}
              <div>
                <label className={labelCls}>Product Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Wireless Headphones"
                  className={inputCls("name")}
                />
                {errors.name && (
                  <p className="text-rose-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Short description */}
              <div>
                <label className={labelCls}>Short Description *</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="One-liner shown on product cards"
                  className={inputCls("shortDescription")}
                />
                {errors.shortDescription && (
                  <p className="text-rose-500 text-xs mt-1">
                    {errors.shortDescription}
                  </p>
                )}
              </div>

              {/* Full description */}
              <div>
                <label className={labelCls}>Full Description *</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed product description…"
                  className={`${inputCls("description")} resize-none`}
                />
                {errors.description && (
                  <p className="text-rose-500 text-xs mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>

            {/* Specifications card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 text-sm">
                  Specifications
                </h3>
                <button
                  type="button"
                  onClick={addSpec}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#004aad] hover:text-[#0056cc] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Row
                </button>
              </div>

              <div className="space-y-2">
                {specs.map((spec, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={spec.key}
                      onChange={(e) => updateSpec(i, "key", e.target.value)}
                      placeholder="e.g. Battery Life"
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004aad]/25 focus:border-[#004aad] transition-all"
                    />
                    <span className="text-slate-300 text-sm">:</span>
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => updateSpec(i, "value", e.target.value)}
                      placeholder="e.g. 30 hours"
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004aad]/25 focus:border-[#004aad] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpec(i)}
                      className="p-2 text-slate-300 hover:text-rose-500 transition-colors flex-shrink-0"
                      aria-label="Remove spec row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400">
                Each row maps to a{" "}
                <code className="bg-slate-100 px-1 rounded">&#123; key, value &#125;</code>{" "}
                entry sent to the backend.
              </p>
            </div>
          </div>

          {/* ── Sidebar column ── */}
          <div className="space-y-5">

            {/* Image card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm">Product Image</h3>

              {/* Preview */}
              <div className="aspect-square w-full rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                {image ? (
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-300">
                    <ImageIcon className="w-10 h-10" />
                    <span className="text-xs">Image Preview</span>
                  </div>
                )}
              </div>

              <div>
                <label className={labelCls}>Image URL *</label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://…"
                  className={inputCls("image")}
                />
                {errors.image && (
                  <p className="text-rose-500 text-xs mt-1">{errors.image}</p>
                )}
              </div>
            </div>

            {/* Pricing & meta card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm">
                Pricing &amp; Meta
              </h3>

              {/* Price */}
              <div>
                <label className={labelCls}>Price *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className={`${inputCls("price")} pl-7`}
                  />
                </div>
                {errors.price && (
                  <p className="text-rose-500 text-xs mt-1">{errors.price}</p>
                )}
              </div>

              {/* Category — preset select + optional custom input */}
              <div>
                <label className={labelCls}>Category *</label>
                {!useCustomCategory ? (
                  <>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={inputCls("category")}
                    >
                      <option value="">Select a category…</option>
                      {CATEGORY_PRESETS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setUseCustomCategory(true)}
                      className="text-xs text-[#004aad] hover:underline mt-1.5 inline-block"
                    >
                      + Enter custom category
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="e.g. Electronics"
                      className={inputCls("category")}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setUseCustomCategory(false);
                        setCustomCategory("");
                      }}
                      className="text-xs text-slate-400 hover:text-slate-600 mt-1.5 inline-block"
                    >
                      ← Use preset list
                    </button>
                  </>
                )}
                {errors.category && (
                  <p className="text-rose-500 text-xs mt-1">{errors.category}</p>
                )}
              </div>

              {/* Badge */}
              <div>
                <label className={labelCls}>Badge</label>
                <select
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className={inputCls("badge")}
                >
                  <option value="">None</option>
                  {BADGE_PRESETS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className={labelCls}>Rating (0–5)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className={inputCls("rating")}
                />
                {errors.rating && (
                  <p className="text-rose-500 text-xs mt-1">{errors.rating}</p>
                )}
              </div>

              {/* In Stock toggle */}
              <div className="flex items-center justify-between py-1">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  In Stock
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={inStock}
                  onClick={() => setInStock((prev) => !prev)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#004aad]/40 ${
                    inStock ? "bg-[#004aad]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full shadow transition-transform duration-200 ${
                      inStock ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
