# Authentication & Authorization

There are two completely separate auth systems in this project. They share no state or tokens.

## 1. Admin Auth (JWT in localStorage)

Used by `/admin/*` routes.

### Token storage
- Key: `tbs_admin_token` (exported from `src/lib/axios.ts` as `TOKEN_KEY`)
- Stored in `localStorage` — not a cookie
- Attached automatically to every Axios request via interceptor in `src/lib/axios.ts`
- On 401 (non-login endpoint): interceptor clears token and redirects to `/admin/login`

### Login flow
1. `AdminAuthContext.login()` calls `loginRequest()` from `src/lib/api/auth.ts`
2. `loginRequest` POSTs directly to `NEXT_PUBLIC_API_BASE_URL/api/auth/login` (external backend, not a Next.js route)
3. On success: token stored in localStorage, admin profile saved to context state

### Dev bypass
Activate by setting all three env vars:
```
NEXT_PUBLIC_DEV_ADMIN_EMAIL=...
NEXT_PUBLIC_DEV_ADMIN_PASSWORD=...
NEXT_PUBLIC_ADMIN_DEV_TOKEN=...   # must match server-side ADMIN_DEV_TOKEN
```
When `NODE_ENV === "development"` and all three are set, logging in with those exact credentials skips the backend entirely and stores the dev token. The dev token is also accepted server-side without signature verification.

### Server-side verification (`src/lib/api/admin-auth.ts`)
`verifyAdminToken(authorizationHeader)` tries three strategies in order:
1. **Dev token bypass** — matches `ADMIN_DEV_TOKEN` / `NEXT_PUBLIC_ADMIN_DEV_TOKEN`
2. **Local JWT** — HMAC-SHA256 verification against `JWT_SECRET` or `ADMIN_JWT_SECRET`; checks `exp` claim
3. **Backend fallback** — forwards to `NEXT_PUBLIC_API_BASE_URL/api/auth/me`

Returns `VerifyOk | VerifyFail`. Always check `if (!auth.ok) return auth.response` before proceeding.

### Route guard placement
Admin auth is enforced **client-side** in `admin/dashboard/layout.tsx` via `useEffect` redirect. There is a brief unauthenticated render window — a loading spinner is shown until the auth check resolves. This is intentional (admin section is not indexed by search engines).

---

## 2. Portal User Auth (HTTP-only cookie)

Used by `/portal/*` and `/user/login` routes.

### Token storage
- Cookie name: `tbs_user_token`
- HTTP-only, set by `POST /api/auth/user/login`
- 8-hour expiry; `Secure` flag set in production
- Never accessible from JavaScript

### Login flow
1. `UserAuthContext.login()` calls `fetch("/api/auth/user/login", { credentials: "include" })`
2. Next.js route (`src/app/api/auth/user/login/route.ts`) proxies to backend, then sets the cookie on the response
3. On success: `PortalUserSession` saved to context state (includes `userId`, `email`, `name`, `permissions`)

### Session restore
On mount, `UserAuthContext` calls `GET /api/auth/user/me` with `credentials: "include"`. The Next.js route reads the cookie and proxies to the backend. `isLoading` stays `true` until this resolves — always check `isLoading` before rendering auth-dependent UI.

### Edge middleware protection (`src/proxy.ts`)
All `/portal/*` routes are protected **before React renders** via edge-level JWT verification:
- Reads `tbs_user_token` cookie
- Verifies with `jose.jwtVerify` using `USER_JWT_SECRET` or `JWT_SECRET`
- JWT must have `issuer: "tbs-portal"` and `audience: "tbs-portal-users"`
- For `/portal/[moduleKey]` routes: checks `payload.permissions[moduleKey] === true`; redirects to `/portal` if false
- Unauthenticated: redirects to `/user/login?next=<pathname>` and clears the cookie

The matcher in `proxy.ts` is `["/portal/:path*"]`. This file must be imported/re-exported by the root `middleware.ts` to activate.

---

## Environment Variables Reference

| Variable | Side | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Both | External backend URL (default: `http://localhost:5000`) |
| `NEXT_PUBLIC_SITE_URL` | Client | This site's own base URL |
| `ADMIN_DEV_TOKEN` | Server | Dev bypass token (server-side check) |
| `NEXT_PUBLIC_ADMIN_DEV_TOKEN` | Client | Dev bypass token (must equal `ADMIN_DEV_TOKEN`) |
| `NEXT_PUBLIC_DEV_ADMIN_EMAIL` | Client | Dev mode login email |
| `NEXT_PUBLIC_DEV_ADMIN_PASSWORD` | Client | Dev mode login password |
| `JWT_SECRET` | Server | HMAC secret for admin JWT + portal user JWT fallback |
| `ADMIN_JWT_SECRET` | Server | Alternative admin JWT secret (checked if `JWT_SECRET` absent) |
| `USER_JWT_SECRET` | Server/Edge | HMAC secret for portal user JWT (takes precedence over `JWT_SECRET`) |
| `NODE_ENV` | Both | Standard — dev bypass only active when `"development"` |

---

## Portal Module Permissions

The `permissions` object in the JWT payload and `UserAuthContext` maps every `ModuleKey` to a boolean. The canonical list lives in `src/types/index.ts`:

```ts
export const MODULE_KEYS = [
  "attendance", "assetMaster", "productMaster", "employeeMaster",
  "payrollSheet", "accountsModule", "inventoryReport",
  "profitAndLoss", "balanceSheet", "trialBalance",
] as const;
```

- The portal dashboard page renders only the tiles the user has `true` for.
- The edge middleware blocks navigation to a module route if the permission is `false`.
- When adding a new module: add its key to `MODULE_KEYS`, add a label to `MODULE_LABELS`, create the route folder, and add it to the admin user management UI.
