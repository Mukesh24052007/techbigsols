import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Images ──────────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "nhxkqgwbiiaervkaeres.supabase.co",
      },
      {
        protocol: "https",
        hostname: "techbigsolutions.in",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  // ── Security & performance headers ─────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // Cache static assets aggressively
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // No-cache on API routes
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },

  // ── Redirects ───────────────────────────────────────────────────────────────
  async redirects() {
    return [
      // Ensure www → non-www (add inverse if you prefer www)
      {
        source: "/(.*)",
        has: [{ type: "host", value: "www.techbigsolutions.in" }],
        destination: "https://techbigsolutions.in/:1",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
