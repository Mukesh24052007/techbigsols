/**
 * /api/products
 *
 * GET  — Public. Returns all products (with optional filtering by category, in_stock, and search).
 * POST — 🔒 Admin JWT. Creates a new product.
 */

import type { NextRequest } from "next/server";
import { verifyAdminToken } from "@/lib/api/admin-auth";
import {
  getAllProducts,
  createProduct,
  toApiProduct,
  fromApiProduct,
  generateId,
} from "@/lib/api/products-store";

// ─── GET /api/products ────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const inStock = searchParams.get("in_stock") || searchParams.get("inStock");
  const search = searchParams.get("search") || searchParams.get("q");

  let products: Awaited<ReturnType<typeof getAllProducts>>;
  try {
    products = await getAllProducts();
  } catch (err) {
    console.error("[GET /api/products] DB error:", err);
    return Response.json(
      { success: false, message: "Failed to fetch products." },
      { status: 500 }
    );
  }

  // Filter by category
  if (category && category.toLowerCase() !== "all") {
    products = products.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Filter by inStock
  if (inStock === "yes" || inStock === "true") {
    products = products.filter((p) => p.inStock);
  } else if (inStock === "no" || inStock === "false") {
    products = products.filter((p) => !p.inStock);
  }

  // Filter by search query
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  return Response.json({
    success: true,
    count: products.length,
    data: products.map(toApiProduct),
  });
}

// ─── POST /api/products ───────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // 1. Authenticate with Admin JWT
  const auth = await verifyAdminToken(request.headers.get("authorization"));
  if (!auth.ok) {
    return auth.response;
  }

  // 2. Parse body
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, message: "Invalid JSON body." },
      { status: 400 }
    );
  }

  // 3. Validate required fields (supporting both snake_case and camelCase)
  const name = body.name;
  const price = body.price;
  const image = body.image_url ?? body.image;
  const shortDescription = body.short_description ?? body.shortDescription;
  const fullDescription = body.full_description ?? body.description;
  const category = body.category;

  const missing: string[] = [];
  if (!name || String(name).trim() === "") missing.push("name");
  if (price === undefined || price === null || price === "" || isNaN(Number(price))) missing.push("price");
  if (!image || String(image).trim() === "") missing.push("image_url");
  if (!shortDescription || String(shortDescription).trim() === "") missing.push("short_description");
  if (!fullDescription || String(fullDescription).trim() === "") missing.push("full_description");
  if (!category || String(category).trim() === "") missing.push("category");

  if (missing.length > 0) {
    return Response.json(
      {
        success: false,
        message: `Missing or invalid required fields: ${missing.join(", ")}`,
      },
      { status: 422 }
    );
  }

  try {
    const id = generateId();
    const product = fromApiProduct(body, id);
    const created = await createProduct(product);

    return Response.json(
      { success: true, data: toApiProduct(created) },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/products] Error creating product:", err);
    return Response.json(
      { success: false, message: "Failed to create product in database." },
      { status: 500 }
    );
  }
}
