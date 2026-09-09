import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/contact", "/services", "/products"],
        disallow: ["/admin/", "/portal/", "/user/", "/api/"],
      },
    ],
    sitemap: "https://techbigsolutions.in/sitemap.xml",
  };
}
