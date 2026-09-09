# TechBigSolutions — Project Overview

TechBigSolutions is a Next.js 16 (App Router) project for a Bangalore-based IT services company. It has three distinct user-facing sections and a products API backed by an in-memory store, with all user/auth data proxied to an external backend.

## Site: `techbigsolutions.in`

## App Sections

| Section | URL prefix | Purpose |
|---|---|---|
| Public marketing site | `/`, `/about`, `/contact`, `/products`, `/services` | Public-facing company website |
| Admin CMS | `/admin/dashboard` | Product and user management |
| User portal | `/portal/*` | Internal ERP-style modules for portal users |
| User auth | `/user/login` | Portal user login |

## Tech Stack

- **Framework**: Next.js 16.3.3 with React 19, App Router only (no Pages Router)
- **Language**: TypeScript throughout
- **Styling**: Tailwind CSS v4 — configured via `@theme {}` in `globals.css`, no `tailwind.config.js`
- **Icons**: `lucide-react`
- **HTTP client**: `axios` (admin backend calls), native `fetch` (portal user calls)
- **JWT**: `jose` (Edge-compatible, used in middleware/proxy)
- **Password hashing**: `bcryptjs`
- **Class utilities**: `clsx` + `tailwind-merge`

## Key Files Quick Reference

| File | Role |
|---|---|
| `src/types/index.ts` | Single source of truth for all shared types |
| `src/lib/api/products-store.ts` | In-memory product CRUD store |
| `src/lib/api/backend.ts` | Server-side fetch helper for external backend calls |
| `src/lib/api/admin-auth.ts` | Server-side admin JWT verification |
| `src/proxy.ts` | Edge middleware logic for portal auth |
| `src/lib/axios.ts` | Shared Axios instance for admin backend calls |
| `src/app/globals.css` | All Tailwind v4 design tokens |

## External Backend

A separate backend runs at `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:5000`). This Next.js app proxies user auth and user management to it. Product CRUD is handled locally in the Next.js in-memory store.
