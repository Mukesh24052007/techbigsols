/**
 * /api/products/[id]
 *
 * GET    — Public. Returns a single product by ID.
 * PUT    — 🔒 Admin JWT. Update product (partial or full update supported).
 * DELETE — 🔒 Admin JWT. Delete product.
 */

import type { NextRequest } from "next/server";
import { verifyAdminToken } from "@/lib/api/admin-auth";
import {
  getProductById,
  updateProduct,
  deleteProduct,
  toApiProduct,
  fromApiProduct,
  type ApiProduct,
} from "@/lib/api/products-store";

// ─── GET /api/products/[id] ───────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let product: Awaited<ReturnType<typeof getProductById>>;
  try {
    product = await getProductById(id);
  } catch (err) {
    console.error(`[GET /api/products/${id}] DB error:`, err);
    return Response.json(
      { success: false, message: "Failed to fetch product." },
      { status: 500 }
    );
  }

  if (!product) {
    return Response.json(
      { success: false, message: `Product with id "${id}" not found.` },
      { status: 404 }
    );
  }

  return Response.json({ success: true, data: toApiProduct(product) });
}

// ─── PUT /api/products/[id] ───────────────────────────────────────────────────

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Authenticate with Admin JWT
  const auth = await verifyAdminToken(request.headers.get("authorization"));
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;

  // 2. Verify product exists
  const existing = await getProductById(id);
  if (!existing) {
    return Response.json(
      { success: false, message: `Product with id "${id}" not found.` },
      { status: 404 }
    );
  }

  // 3. Parse JSON body
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, message: "Invalid JSON body." },
      { status: 400 }
    );
  }

  // 4. Merge partial update into existing product representation
  const existingApi: ApiProduct = toApiProduct(existing);

  const mergedBody: Record<string, unknown> = {
    ...existingApi,
    ...body,
    // Preserve id
    id,
  };

  // Map camelCase fields to body if provided
  if (body.shortDescription !== undefined) mergedBody.short_description = body.shortDescription;
  if (body.description !== undefined) mergedBody.full_description = body.description;
  if (body.image !== undefined) mergedBody.image_url = body.image;
  if (body.inStock !== undefined) mergedBody.in_stock = body.inStock ? "yes" : "no";
  if (body.specs !== undefined && typeof body.specs === "object") mergedBody.specs = body.specs;

  try {
    const updatedProductData = fromApiProduct(mergedBody, id);
    const updated = await updateProduct(updatedProductData);

    if (!updated) {
      return Response.json(
        { success: false, message: `Product with id "${id}" not found.` },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: toApiProduct(updated) });
  } catch (err) {
    console.error(`[PUT /api/products/${id}] Error updating:`, err);
    return Response.json(
      { success: false, message: "Failed to update product." },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/products/[id] ────────────────────────────────────────────────

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Authenticate with Admin JWT
  const auth = await verifyAdminToken(request.headers.get("authorization"));
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;

  try {
    const removed = await deleteProduct(id);

    if (!removed) {
      return Response.json(
        { success: false, message: `Product with id "${id}" not found.` },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: `Product "${id}" deleted successfully.`,
    });
  } catch (err) {
    console.error(`[DELETE /api/products/${id}] Error deleting:`, err);
    return Response.json(
      { success: false, message: "Failed to delete product." },
      { status: 500 }
    );
  }
}
