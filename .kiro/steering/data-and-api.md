# Data Layer & API Patterns

## Product Store (in-memory)

Products live in `src/lib/api/products-store.ts`. There is no database or ORM. The store uses `globalThis.__tbs_products__` as the backing array — it persists across requests within a single server process and resets on restart.

### CRUD functions (all async for drop-in compatibility)

```ts
getAllProducts(): Promise<Product[]>
getProductById(id: string): Promise<Product | null>
createProduct(product: Product): Promise<Product>
updateProduct(updated: Product): Promise<Product | null>
deleteProduct(id: string): Promise<boolean>
generateId(): string   // returns a unique `prod-xxx-nn` style ID
```

Every function returns a shallow copy — callers cannot mutate the store directly.

### Wire conversion helpers

Always go through these at the API boundary:

```ts
toApiProduct(p: Product): ApiProduct       // internal camelCase → wire snake_case
fromApiProduct(body: Record<string, unknown>, id: string): Product  // wire → internal
```

`fromApiProduct` accepts both `snake_case` and `camelCase` field names from the request body.

### ApiProduct wire shape (snake_case)

```ts
interface ApiProduct {
  id: string;
  name: string;
  short_description: string;
  full_description: string;
  specifications: { key: string; value: string }[];  // NOT a plain object
  image_url: string;
  price: number;
  category: string;
  badge?: string;
  rating: number;
  in_stock: "yes" | "no";  // string, not boolean
}
```

Internal `Product.specs` is `{ [key: string]: string }`. Wire `specifications` is `{ key, value }[]`. The conversion handles this automatically.

---

## External Backend Proxy (`backendFetch`)

`src/lib/api/backend.ts` is server-only. Use it in API routes to proxy to the external backend.

```ts
const result = await backendFetch("/api/some-path", {
  method: "POST",
  authorization: request.headers.get("authorization"),
  cookie: request.headers.get("cookie"),
  body: { key: "value" },
});

if (!result.ok) {
  return Response.json(result.data, { status: result.status });
}
// result.data contains parsed JSON
// result.headers contains raw headers (e.g. for forwarding Set-Cookie)
```

`backendFetch` **never throws**. Network failures return `{ ok: false, status: 502 }`. Always check `result.ok`.

To forward cookies from the backend response (e.g. setting `tbs_user_token`):

```ts
const setCookie = result.headers.get("set-cookie");
const response = Response.json(result.data, { status: result.status });
if (setCookie) response.headers.set("set-cookie", setCookie);
return response;
```

---

## Client-side API helpers

### Admin (Axios-based) — `src/lib/api/products.ts`

Used by admin UI components to talk to `/api/products/*`.

```ts
fetchProducts(params?: { category?: string; search?: string }): Promise<Product[]>
fetchProduct(id: string): Promise<Product>
createProductRequest(data: Partial<ApiProduct>): Promise<Product>
updateProductRequest(id: string, data: Partial<ApiProduct>): Promise<Product>
deleteProductRequest(id: string): Promise<void>
extractApiError(err: unknown): string   // pulls message from Axios error
toProduct(api: ApiProduct): Product     // wire → internal (client-side)
toApiBody(p: Product): Partial<ApiProduct>  // internal → wire body
```

Uses `apiClient` from `src/lib/axios.ts` — the admin JWT is attached automatically.

### Portal users (fetch-based)

Portal user calls use native `fetch` with `credentials: "include"` (no Axios). All portal API calls go through `/api/auth/user/*` Next.js routes, never directly to the backend.

---

## API Response Shape

All API routes return this envelope:

```ts
// Success
{ success: true, data: T, count?: number }

// Error
{ success: false, message: string }
```

HTTP status codes:
| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Invalid JSON body |
| 401 | Missing or invalid auth token |
| 404 | Resource not found |
| 422 | Missing or invalid required fields |
| 500 | Internal server error |
| 502 | External backend unreachable |

---

## Adding a New API Route

### Self-contained (like products)

1. Create `src/app/api/<resource>/route.ts`
2. Protect write operations with `verifyAdminToken`
3. Add CRUD functions to the relevant store file (or create a new one following `products-store.ts`)
4. Add wire conversion helpers and keep internal/wire shapes separate
5. Add client-side helpers to a new `src/lib/api/<resource>.ts` file

### Proxy route (like users)

1. Create `src/app/api/<resource>/route.ts`
2. Import `backendFetch` from `@/lib/api/backend`
3. Forward auth headers as needed
4. Return `Response.json(result.data, { status: result.status })`

---

## Static Data

Public marketing content lives in `src/data/`:
- `products.ts` — seed/static product catalog (separate from the in-memory store's `initialProducts`)
- `services.ts` — service listing data consumed by the services page and home sections

These are plain TypeScript arrays — no fetch required. Import directly into components or pages.
