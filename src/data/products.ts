import { Product } from "@/types";

export const productsData: Product[] = [
  {
    id: "fan-01",
    name: "Hokiit Mini Portable Hand Fan",
    category: "Accessories",
    price: 24.99,
    rating: 4.8,
    reviewsCount: 142,
    badge: "New",
    image: "https://nhxkqgwbiiaervkaeres.supabase.co/storage/v1/object/public/products/1786618394063-mini-portable-hand-fan-with-5-speed-1800-mah-battery-usb-fan-original-imahnkpxae9cnbg7.jpg",
    shortDescription: "Portable cooling solution with a high-capacity 1800mAh battery and 5 adjustable speeds. Perfect for on-the-go professionals.",
    description: "Engineered for whisper-quiet airflow, the Hokiit Mini Fan features a turbocharged brushless motor, 5-speed digital gear selector, and an ergonomic folding stand for desktop or handheld operation. Fast Type-C charging guarantees 12+ hours continuous usage.",
    specs: {
      "Battery": "1800 mAh Li-ion",
      "Speeds": "5 Step Adjustable",
      "Charging Port": "USB Type-C",
      "Weight": "165g",
      "Runtime": "Up to 14 hours"
    },
    inStock: true
  },
  {
    id: "chopper-02",
    name: "NEV Chopr Electric Vegetable Chopper",
    category: "Smart Devices",
    price: 45.00,
    rating: 4.9,
    reviewsCount: 230,
    badge: "Best Seller",
    image: "https://nhxkqgwbiiaervkaeres.supabase.co/storage/v1/object/public/products/1786618727908-Screenshot%202026-08-13%20162829.jpg",
    shortDescription: "Efficient and compact electric chopper, streamlining your breakroom or home office preparation tasks with precision.",
    description: "Featuring dual stainless-steel 4D S-curved blades and a robust 300W pure copper motor, the NEV Chopr effortlessly dices vegetables, nuts, and culinary ingredients in seconds. Features a BPA-free glass bowl and one-touch pulse control.",
    specs: {
      "Motor Power": "300W High Torque",
      "Blade Material": "304 Stainless Steel",
      "Capacity": "2.0 Liters",
      "Safety": "Thermal Overload Protection",
      "Operation": "One-Touch Pulse"
    },
    inStock: true
  },
  {
    id: "mug-03",
    name: "TBS Smart Temperature Mug Pro",
    category: "Smart Devices",
    price: 89.99,
    rating: 4.7,
    reviewsCount: 88,
    badge: "Popular",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop",
    shortDescription: "Keep your coffee or tea at the exact preferred temperature all day long with Bluetooth app connectivity.",
    description: "Crafted from scratch-resistant ceramic coating over food-grade stainless steel. Set target drinking temperature via precision touch sensors or the TBS companion smartphone app. Includes Qi-compatible wireless charging coaster.",
    specs: {
      "Temperature Range": "120°F - 145°F (50°C - 62.5°C)",
      "Battery Life": "3 Hours (All-day on coaster)",
      "Connectivity": "Bluetooth 5.2 BLE",
      "Capacity": "14 oz / 414 ml",
      "Water Resistance": "IPX7 Submersible"
    },
    inStock: true
  },
  {
    id: "workstation-04",
    name: "Enterprise Pro Tower Workstation",
    category: "Hardware",
    price: 1299.00,
    rating: 5.0,
    reviewsCount: 64,
    badge: "Featured",
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=800&auto=format&fit=crop",
    shortDescription: "High-performance enterprise desktop configured for CAD, software development, data analytics, and intense virtualization.",
    description: "Built for mission-critical enterprise workloads. Features latest multi-core processor architecture, ECC DDR5 RAM support, enterprise NVMe Gen4 storage arrays, and redundant Gold-certified power supplies.",
    specs: {
      "Processor": "Intel Core i9 / AMD Ryzen 9 Enterprise",
      "Memory": "64GB DDR5 ECC (Expandable to 128GB)",
      "Storage": "2TB NVMe PCIe 4.0 SSD",
      "Graphics": "NVIDIA RTX Professional 16GB",
      "Warranty": "3-Year On-Site NBD Support"
    },
    inStock: true
  },
  {
    id: "network-05",
    name: "TBS SecureEdge Multi-Gig Router",
    category: "Hardware",
    price: 349.00,
    rating: 4.9,
    reviewsCount: 52,
    badge: "Featured",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop",
    shortDescription: "Next-gen Wi-Fi 7 enterprise router with hardware-accelerated firewall and multi-WAN failover for flawless office uptime.",
    description: "Deliver blazing fast, ultra-reliable network coverage across enterprise offices. Includes integrated intrusion prevention, VLAN segmentation, zero-touch VPN tunnels, and centralized cloud dashboard management.",
    specs: {
      "Speed": "Wi-Fi 7 Tri-Band 19 Gbps",
      "Ports": "2x 10GbE SFP+ / 4x 2.5GbE PoE+",
      "Security": "WPA3 Enterprise + IPS/IDS",
      "Clients": "Up to 500 Active Connections",
      "Management": "Cloud Dashboard + Local CLI"
    },
    inStock: true
  },
  {
    id: "hub-06",
    name: "TBS Thunderbolt 4 Quad-Display Dock",
    category: "Office Tech",
    price: 199.99,
    rating: 4.8,
    reviewsCount: 119,
    image: "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?q=80&w=800&auto=format&fit=crop",
    shortDescription: "14-in-1 universal Thunderbolt 4 workstation hub with 100W Power Delivery and dual 4K/quad display output.",
    description: "Streamline desk connectivity with one single cable. Connect up to 4 high-resolution displays, ultra-fast external storage, gigabit ethernet, SD 4.0 card readers, and hi-res audio without bottlenecks.",
    specs: {
      "Host Connection": "Thunderbolt 4 / USB4 40Gbps",
      "Power Delivery": "100W Host Charging",
      "Display Support": "Dual 4K @ 120Hz / Single 8K @ 60Hz",
      "Ports": "14 Ports Total",
      "Housing": "Anodized Aerospace Aluminum"
    },
    inStock: true
  }
];
