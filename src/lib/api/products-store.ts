/**
 * Product store — in-memory backed.
 *
 * Provides typed CRUD operations for products.
 * The store is initialised with the default catalog on first use and lives in
 * Node.js module scope, so it persists across requests within a single server
 * process (dev and production single-instance deployments).
 *
 * All public function signatures are identical to the previous Prisma-backed
 * version so API route handlers require no changes.
 */

import { Product } from "@/types";

// ────────────────────────────────────────────────────────────────────────────
// Wire-facing shape (snake_case, standard REST JSON contract)
// ────────────────────────────────────────────────────────────────────────────

export interface ApiProduct {
  id: string;
  name: string;
  short_description: string;
  full_description: string;
  specifications: { key: string; value: string }[];
  image_url: string;
  price: number;
  category: string;
  badge?: string;
  rating: number;
  in_stock: "yes" | "no";
}

// ────────────────────────────────────────────────────────────────────────────
// Initial Default Catalog
// ────────────────────────────────────────────────────────────────────────────

export const initialProducts: Product[] = [
  {
    id: "prod-fan-01",
    name: "Hokiit Mini Portable Hand Fan",
    category: "Accessories",
    price: 24.99,
    rating: 4.8,
    badge: "New",
    image:
      "https://nhxkqgwbiiaervkaeres.supabase.co/storage/v1/object/public/products/1786618394063-mini-portable-hand-fan-with-5-speed-1800-mah-battery-usb-fan-original-imahnkpxae9cnbg7.jpg",
    shortDescription:
      "Portable cooling solution with a high-capacity 1800mAh battery and 5 adjustable speeds.",
    description:
      "Engineered for whisper-quiet airflow, the Hokiit Mini Fan features a turbocharged brushless motor, 5-speed digital gear selector, and an ergonomic folding stand for desktop or handheld operation. Fast Type-C charging guarantees 12+ hours continuous usage.",
    specs: {
      Battery: "1800 mAh Li-ion",
      Speeds: "5 Step Adjustable",
      "Charging Port": "USB Type-C",
      Weight: "165g",
      Runtime: "Up to 14 hours",
    },
    inStock: true,
  },
  {
    id: "prod-chopper-02",
    name: "NEV Chopr Electric Vegetable Chopper",
    category: "Smart Devices",
    price: 45.0,
    rating: 4.9,
    badge: "Best Seller",
    image:
      "https://nhxkqgwbiiaervkaeres.supabase.co/storage/v1/object/public/products/1786618727908-Screenshot%202026-08-13%20162829.jpg",
    shortDescription:
      "Compact electric chopper streamlining food preparation tasks with precision.",
    description:
      "Featuring dual stainless-steel 4D S-curved blades and a robust 300W pure copper motor, the NEV Chopr effortlessly dices vegetables, nuts, and culinary ingredients in seconds. Features a BPA-free glass bowl and one-touch pulse control.",
    specs: {
      "Motor Power": "300W High Torque",
      "Blade Material": "304 Stainless Steel",
      Capacity: "2.0 Liters",
      Safety: "Thermal Overload Protection",
    },
    inStock: true,
  },
  {
    id: "prod-mug-03",
    name: "TBS Smart Temperature Mug Pro",
    category: "Smart Devices",
    price: 89.99,
    rating: 4.7,
    badge: "Popular",
    image:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop",
    shortDescription:
      "Keep your beverages at the exact preferred temperature all day long with app connectivity.",
    description:
      "Crafted from scratch-resistant ceramic coating over food-grade stainless steel. Set target drinking temperature via precision touch sensors or the companion smartphone app. Includes Qi-compatible wireless charging coaster.",
    specs: {
      "Temperature Range": "120°F - 145°F",
      "Battery Life": "3 Hours (All-day on coaster)",
      Connectivity: "Bluetooth 5.2 BLE",
      Capacity: "14 oz / 414 ml",
    },
    inStock: true,
  },
  {
    id: "prod-workstation-04",
    name: "Enterprise Pro Tower Workstation",
    category: "Hardware",
    price: 1299.0,
    rating: 5.0,
    badge: "Featured",
    image:
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=800&auto=format&fit=crop",
    shortDescription:
      "High-performance enterprise desktop configured for CAD, software development, and AI workloads.",
    description:
      "Built for mission-critical enterprise workloads. Features latest multi-core processor architecture, ECC DDR5 RAM support, enterprise NVMe Gen4 storage arrays, and redundant Gold-certified power supplies.",
    specs: {
      Processor: "Intel Core i9 / AMD Ryzen 9 Enterprise",
      Memory: "64GB DDR5 ECC (Expandable to 128GB)",
      Storage: "2TB NVMe PCIe 4.0 SSD",
      Graphics: "NVIDIA RTX Professional 16GB",
    },
    inStock: true,
  },
  {
    id: "prod-network-05",
    name: "TBS SecureEdge Multi-Gig Router",
    category: "Hardware",
    price: 349.0,
    rating: 4.9,
    badge: "Featured",
    image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop",
    shortDescription:
      "Next-gen Wi-Fi 7 enterprise router with hardware-accelerated firewall and multi-WAN failover.",
    description:
      "Deliver blazing fast, ultra-reliable network coverage across enterprise offices. Includes integrated intrusion prevention, VLAN segmentation, zero-touch VPN tunnels, and centralized cloud dashboard management.",
    specs: {
      Speed: "Wi-Fi 7 Tri-Band 19 Gbps",
      Ports: "2x 10GbE SFP+ / 4x 2.5GbE PoE+",
      Security: "WPA3 Enterprise + IPS/IDS",
      Clients: "Up to 500 Active Connections",
    },
    inStock: true,
  },
  {
    id: "prod-hub-06",
    name: "TBS Thunderbolt 4 Quad-Display Dock",
    category: "Office Tech",
    price: 199.99,
    rating: 4.8,
    badge: undefined,
    image:
      "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?q=80&w=800&auto=format&fit=crop",
    shortDescription:
      "14-in-1 universal Thunderbolt 4 workstation hub with 100W Power Delivery and quad display output.",
    description:
      "Streamline desk connectivity with one single cable. Connect up to 4 high-resolution displays, ultra-fast external storage, gigabit ethernet, SD 4.0 card readers, and hi-res audio without bottlenecks.",
    specs: {
      "Host Connection": "Thunderbolt 4 / USB4 40Gbps",
      "Power Delivery": "100W Host Charging",
      "Display Support": "Dual 4K @ 120Hz / Single 8K @ 60Hz",
      Ports: "14 Ports Total",
    },
    inStock: true,
  },
];

// ────────────────────────────────────────────────────────────────────────────
// In-memory store
// Stored on globalThis so Next.js hot-reloads don't reset the data in dev.
// ────────────────────────────────────────────────────────────────────────────

const g = globalThis as typeof globalThis & { __tbs_products__?: Product[] };

function getStore(): Product[] {
  if (!g.__tbs_products__) {
    // Deep-clone the seed so mutations never affect the original array.
    g.__tbs_products__ = initialProducts.map((p) => ({ ...p, specs: { ...p.specs } }));
  }
  return g.__tbs_products__;
}

// ────────────────────────────────────────────────────────────────────────────
// Conversion helpers  (public — consumed by route handlers)
// ────────────────────────────────────────────────────────────────────────────

/** Internal camelCase Product → wire snake_case ApiProduct */
export function toApiProduct(p: Product): ApiProduct {
  const specsObj = p.specs || {};
  return {
    id: p.id,
    name: p.name,
    short_description: p.shortDescription,
    full_description: p.description,
    specifications: Object.entries(specsObj).map(([key, value]) => ({
      key,
      value: String(value),
    })),
    image_url: p.image,
    price: Number(p.price),
    category: p.category,
    badge: p.badge || undefined,
    rating: Number(p.rating),
    in_stock: p.inStock ? "yes" : "no",
  };
}

/** Any wire body (snake_case or camelCase) → internal camelCase Product */
export function fromApiProduct(
  body: Record<string, unknown>,
  id: string
): Product {
  const specsMap: Record<string, string> = {};

  if (Array.isArray(body.specifications)) {
    for (const item of body.specifications) {
      if (item && typeof item === "object" && "key" in item && "value" in item) {
        specsMap[String(item.key)] = String(item.value);
      }
    }
  } else if (body.specs && typeof body.specs === "object") {
    for (const [k, v] of Object.entries(body.specs as Record<string, unknown>)) {
      specsMap[k] = String(v);
    }
  }

  const inStockValue =
    body.in_stock !== undefined
      ? body.in_stock === "yes" || body.in_stock === true || body.in_stock === "true"
      : body.inStock !== undefined
      ? Boolean(body.inStock)
      : true;

  const rawBadge =
    body.badge !== undefined && body.badge !== null && body.badge !== ""
      ? String(body.badge)
      : undefined;

  return {
    id,
    name: String(body.name ?? "").trim(),
    shortDescription: String(
      body.short_description ?? body.shortDescription ?? ""
    ).trim(),
    description: String(
      body.full_description ?? body.description ?? ""
    ).trim(),
    specs: specsMap,
    image: String(body.image_url ?? body.image ?? "").trim(),
    price: Number(body.price) || 0,
    category: (body.category as Product["category"]) || "Accessories",
    badge: rawBadge as Product["badge"] | undefined,
    rating: body.rating !== undefined ? Number(body.rating) : 4.5,
    inStock: inStockValue,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// CRUD helpers  (async signatures kept for drop-in compatibility)
// ────────────────────────────────────────────────────────────────────────────

export async function getAllProducts(): Promise<Product[]> {
  // Return a shallow copy of each item so callers can't mutate the store.
  return getStore().map((p) => ({ ...p, specs: { ...p.specs } }));
}

export async function getProductById(id: string): Promise<Product | null> {
  const p = getStore().find((x) => x.id === id);
  return p ? { ...p, specs: { ...p.specs } } : null;
}

export async function createProduct(product: Product): Promise<Product> {
  const store = getStore();
  const entry: Product = { ...product, specs: { ...product.specs } };
  store.unshift(entry); // newest first, mirroring the previous ORDER BY createdAt DESC
  return { ...entry, specs: { ...entry.specs } };
}

export async function updateProduct(updated: Product): Promise<Product | null> {
  const store = getStore();
  const idx = store.findIndex((x) => x.id === updated.id);
  if (idx === -1) return null;
  const entry: Product = { ...updated, specs: { ...updated.specs } };
  store[idx] = entry;
  return { ...entry, specs: { ...entry.specs } };
}

export async function deleteProduct(id: string): Promise<boolean> {
  const store = getStore();
  const idx = store.findIndex((x) => x.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}

/** Generate a short unique ID for new products */
export function generateId(): string {
  return `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
