/**
 * Client-side API helpers for the external backend at NEXT_PUBLIC_API_BASE_URL.
 * Powered by apiClient (axios.ts) whose baseURL points directly at the backend server.
 * All mutating calls attach the Admin JWT automatically via the Axios request interceptor.
 *
 * Wire schema (snake_case) mirrors the backend exactly:
 * {
 *   id, name, short_description, full_description,
 *   specifications: [{ key, value }],
 *   image_url, price, category, badge,
 *   rating, in_stock: 0|1  (MySQL TINYINT)
 * }
 */

import { apiClient } from "@/lib/axios";
import { Product } from "@/types";

// ── Wire shapes ───────────────────────────────────────────────────────────────

export interface ApiProduct {
  id: string;
  name: string;
  short_description: string;
  full_description: string;
  /** Array of { key, value } pairs — exact backend format */
  specifications: { key: string; value: string }[];
  image_url: string;
  price: number;
  category: string;
  badge?: string;
  rating: number;
  reviews_count?: number;
  // MySQL TINYINT comes back as 0/1; backend also accepts "yes"/"no" on write
  in_stock: number | string | boolean;
}

export interface ApiListResponse {
  success: boolean;
  count: number;
  data: ApiProduct[];
}

export interface ApiSingleResponse {
  success: boolean;
  data: ApiProduct;
}

// ── Conversion helpers ────────────────────────────────────────────────────────

/**
 * Normalises whatever the backend sends for in_stock → boolean.
 * MySQL TINYINT  : 1 / 0
 * String         : "yes" / "no" / "true" / "false" / "1" / "0"
 * Boolean        : true / false
 */
function parseInStock(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    return ["yes", "true", "1"].includes(value.toLowerCase());
  }
  return false;
}

/**
 * Wire ApiProduct → internal camelCase Product.
 * Converts specifications array → specs key/value map.
 * Defensively handles backends that return null/missing specifications.
 */
export function toProduct(a: ApiProduct): Product {
  const specs: Record<string, string> = {};

  // Backend may return specifications as null, undefined, or omit the field
  const rawSpecs = a.specifications;
  if (Array.isArray(rawSpecs)) {
    for (const item of rawSpecs) {
      if (item && typeof item.key === "string") {
        specs[item.key] = String(item.value ?? "");
      }
    }
  }

  return {
    id: a.id,
    name: a.name ?? "",
    shortDescription: a.short_description ?? "",
    description: a.full_description ?? "",
    specs,
    image: a.image_url ?? "",
    price: Number(a.price) || 0,
    category: a.category ?? "",
    badge: a.badge || undefined,
    rating: Number(a.rating) || 0,
    inStock: parseInStock(a.in_stock),
  };
}

/**
 * Internal camelCase Product → wire ApiProduct body (no id).
 * Converts specs key/value map → specifications array.
 */
export function toApiBody(p: Product): Omit<ApiProduct, "id"> {
  return {
    name: p.name,
    short_description: p.shortDescription,
    full_description: p.description,
    specifications: Object.entries(p.specs ?? {}).map(([key, value]) => ({
      key,
      value: String(value),
    })),
    image_url: p.image,
    price: Number(p.price),
    category: p.category,
    badge: p.badge || undefined,
    rating: Number(p.rating),
    in_stock: p.inStock ? "yes" : "no",
  };
}

// ── CRUD API calls ────────────────────────────────────────────────────────────

/**
 * GET /api/products — Public
 * Returns all products from the store, mapped to the internal Product shape.
 */
export async function fetchProducts(): Promise<Product[]> {
  const { data } = await apiClient.get<ApiListResponse>("/api/products");
  if (!data?.data) return [];
  return data.data.map(toProduct);
}

/**
 * GET /api/products/:id — Public
 * Returns a single product by ID.
 */
export async function fetchProduct(id: string): Promise<Product> {
  const { data } = await apiClient.get<ApiSingleResponse>(`/api/products/${id}`);

  const raw = (data as unknown) as Record<string, unknown>;
  const apiProduct: ApiProduct =
    (data?.data as ApiProduct) ??
    (raw as unknown as ApiProduct);

  if (!apiProduct || typeof apiProduct !== "object") {
    throw new Error(`Product "${id}" not found`);
  }

  return toProduct(apiProduct);
}

/**
 * POST /api/products — 🔒 Admin JWT required
 * Creates a new product. Returns the created product with server-assigned id.
 */
export async function createProductRequest(product: Product): Promise<Product> {
  const { data } = await apiClient.post<ApiSingleResponse>(
    "/api/products",
    toApiBody(product)
  );

  const raw = (data as unknown) as Record<string, unknown>;
  const apiProduct: ApiProduct =
    (data?.data as ApiProduct) ??
    (raw as unknown as ApiProduct);

  if (!apiProduct || typeof apiProduct !== "object") {
    throw new Error("Unexpected response from server after create.");
  }

  return toProduct(apiProduct);
}

/**
 * PUT /api/products/:id — 🔒 Admin JWT required
 * Full or partial update. Re-fetches the product after update since the
 * backend returns { success, message } with no data body.
 */
export async function updateProductRequest(product: Product): Promise<Product> {
  await apiClient.put(
    `/api/products/${product.id}`,
    toApiBody(product)
  );
  // Backend responds with { success: true, message: '...' } — no product data.
  // Re-fetch so the returned object is always fresh and correctly typed.
  return fetchProduct(product.id);
}

/**
 * DELETE /api/products/:id — 🔒 Admin JWT required
 * Permanently removes the product from the store.
 */
export async function deleteProductRequest(id: string): Promise<void> {
  await apiClient.delete(`/api/products/${id}`);
}

// ── Error helper ──────────────────────────────────────────────────────────────

/**
 * Extracts the most descriptive message from an Axios (or generic) error.
 * Use this in every catch block that calls a products API function.
 */
export function extractApiError(err: unknown, fallback: string): string {
  if (!err || typeof err !== "object") return fallback;
  const axiosErr = err as {
    response?: { data?: { message?: string }; status?: number };
    message?: string;
  };
  const serverMsg = axiosErr.response?.data?.message;
  if (typeof serverMsg === "string" && serverMsg.trim()) return serverMsg;
  if (typeof axiosErr.message === "string" && axiosErr.message.trim())
    return axiosErr.message;
  return fallback;
}
