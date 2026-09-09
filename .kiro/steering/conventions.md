# Coding Conventions

## File & Folder Naming

| Thing | Convention | Example |
|---|---|---|
| Route segments (portal modules) | camelCase matching `ModuleKey` exactly | `assetMaster/`, `profitAndLoss/` |
| Component files | PascalCase | `AdminSidebar.tsx`, `HeroSection.tsx` |
| Lib / utility files | kebab-case | `admin-auth.ts`, `products-store.ts` |
| Context files | PascalCase + `Context` suffix | `AdminAuthContext.tsx` |
| Types file | `index.ts` in `src/types/` | — |

## TypeScript

- All new code is TypeScript. No `any` — use `unknown` then narrow, or define proper interfaces.
- Shared types live in `src/types/index.ts`. Don't define the same shape in multiple files.
- Prefer `interface` for object shapes, `type` for unions/derived types.
- Export named types alongside the code that uses them only when they aren't needed elsewhere; otherwise put them in `src/types/index.ts`.

## React & Components

- Client components require `"use client"` at the top. Server components have no directive.
- The project uses client components broadly — don't try to force RSC for interactive UI.
- Every context module exports:
  1. A `Provider` component (e.g. `AdminAuthProvider`)
  2. A custom hook (e.g. `useAdminAuth()`) that throws a descriptive error if called outside the provider
- Section components on the home page receive callbacks as props (e.g. `onOpenQuoteModal`) rather than consuming context directly — keep this pattern for home sections.
- Use `clsx` for conditional classes and `tailwind-merge` (via a `cn()` helper if you add one) when merging potentially conflicting Tailwind classes.

## API Routes

- All responses use the shape `{ success: boolean, message?: string, data?: ... }`.
- Status codes: 200/201 success · 400 bad JSON · 401 unauthenticated · 404 not found · 422 missing required fields · 500/502 server error.
- Every protected route calls `verifyAdminToken(request.headers.get("authorization"))` at the very top and returns early on failure.
- Always `await params` — Next.js 16 route params are async Promises:
  ```ts
  const { id } = await params;
  ```
- Accept both `snake_case` and `camelCase` field names in request bodies (follow the existing pattern in `products-store.ts`).

## Data Shape: snake_case vs camelCase

- **Internal / in-memory**: camelCase (`shortDescription`, `inStock`, `imageUrl`)
- **Wire / API responses**: snake_case (`short_description`, `in_stock`, `image_url`)
- Always use `toApiProduct` / `fromApiProduct` (or equivalent helpers) at the API boundary. Never expose internal camelCase shapes directly in responses.

## Imports & Path Aliases

- Always use the `@/` alias for imports from `src/`. Never use relative `../` paths reaching outside the current feature folder.
- Import order (enforced by ESLint): external packages → `@/` aliases → relative imports.

## Environment Variables

- Variables prefixed `NEXT_PUBLIC_` are exposed to the client bundle. Never put secrets in `NEXT_PUBLIC_` vars.
- The dev bypass pattern (`ADMIN_DEV_TOKEN` / `NEXT_PUBLIC_ADMIN_DEV_TOKEN`) only activates in `NODE_ENV === "development"` — don't expand it to production flows.
- Full list of env keys is documented in `steering/auth.md`.

## Error Handling

- API route handlers: wrap DB/store calls and JSON parsing in `try/catch`, log with `console.error("[ROUTE path] message:", err)`, return a typed error response.
- `backendFetch()` never throws — check `result.ok` after every call.
- Client context hooks: use try/catch and return a user-readable error string (not throw) from `login()` functions so UI can display the message.
