/**
 * Next.js Middleware entry point.
 *
 * Re-exports the portal auth proxy from src/proxy.ts.
 * This file MUST be named middleware.ts and live in src/ for Next.js to pick it up.
 */
export { proxy as middleware, config } from "./proxy";
