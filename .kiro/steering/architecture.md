# Architecture & Route Structure

## App Router Layout Tree

```
src/app/
├── layout.tsx                     # Root layout: fonts, ToastProvider
├── globals.css                    # Tailwind v4 @theme tokens + global styles
│
├── (public)/                      # Route group — no URL segment
│   ├── layout.tsx                 # CartProvider, QuoteModalProvider, Navbar, Footer, CartDrawer, QuoteModal
│   ├── page.tsx                   # Home page (client component, fetches featured products)
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── products/page.tsx
│   └── services/page.tsx
│
├── admin/
│   ├── layout.tsx                 # AdminAuthProvider + AdminProductsProvider
│   ├── page.tsx                   # Redirects to /admin/dashboard
│   ├── login/page.tsx
│   └── dashboard/
│       ├── layout.tsx             # Client: enforces auth (redirect via useEffect), renders AdminSidebar + AdminTopbar
│       ├── page.tsx               # Dashboard overview
│       ├── products/
│       │   ├── page.tsx           # Product list
│       │   ├── new/page.tsx       # Create product (uses ProductForm)
│       │   └── [id]/edit/page.tsx # Edit product (uses ProductForm)
│       └── users/page.tsx         # User management
│
├── portal/
│   ├── layout.tsx                 # UserAuthProvider + PortalShell
│   ├── page.tsx                   # Portal dashboard (shows permitted module tiles)
│   └── [module]/page.tsx          # One route per ModuleKey (see types/index.ts)
│
├── user/
│   ├── layout.tsx                 # UserAuthProvider wrapper
│   └── login/page.tsx
│
└── api/
    ├── products/
    │   ├── route.ts               # GET (public) / POST (admin JWT)
    │   └── [id]/route.ts          # GET (public) / PUT+DELETE (admin JWT)
    ├── auth/user/
    │   ├── login/route.ts         # POST — proxy to backend, sets tbs_user_token cookie
    │   ├── logout/route.ts        # POST — proxy to backend, clears cookie
    │   └── me/route.ts            # GET — proxy to backend using cookie
    └── admin/users/
        ├── route.ts               # GET/POST — proxy to backend /api/user-master
        ├── modules/route.ts       # GET — returns MODULE_KEYS (with backend fallback)
        └── [id]/route.ts          # GET/PUT/DELETE — proxy to backend /api/user-master/:id
```

## Component Organization

```
src/components/
├── layout/       # Navbar, Footer, GstinBar — public site chrome
├── home/         # 12 section components for the home page
├── admin/        # AdminSidebar, AdminTopbar, ProductForm
├── portal/       # PortalShell, PortalSidebar, PortalTopbar, ModulePlaceholder
├── products/     # Product display components
├── cart/         # CartDrawer and related
└── ui/           # QuoteModal
```

## Context Providers

| Context | Provider Location | State |
|---|---|---|
| `AdminAuthContext` | `admin/layout.tsx` | Admin JWT, login/logout |
| `AdminProductsContext` | `admin/layout.tsx` | Cached product list for admin CRUD |
| `UserAuthContext` | `portal/layout.tsx`, `user/layout.tsx` | Portal user session (cookie-based) |
| `CartContext` | `(public)/layout.tsx` | Cart items (persisted to `localStorage` key `tbs_cart`) |
| `QuoteModalContext` | `(public)/layout.tsx` | Quote modal open/close |
| `ToastContext` | Root `layout.tsx` | Toast notifications (4s auto-dismiss) |

## Data Flow: Products

The products API is fully self-contained in this Next.js app:

```
Client (admin) → /api/products (Next.js route) → products-store.ts (in-memory) → response
Client (public) → /api/products?... → products-store.ts → response
```

## Data Flow: Users / Auth

All user data is proxied:

```
Client → /api/admin/users/* (Next.js proxy route) → backendFetch() → localhost:5000
Client → /api/auth/user/* (Next.js proxy route) → backendFetch() → localhost:5000
```

## Next.js 16 Async Params

Route params are **async** — always `await params`:

```ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ...
}
```
