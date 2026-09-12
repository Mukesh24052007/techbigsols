// Data for ImportExportSection

export interface ImportExportCapability {
  iconName: string;
  badge: string;
  iconColor: string;
  iconBg: string;
  title: string;
  desc: string;
  category: "shipment" | "operations" | "delivery";
}

export const importExportCapabilities: ImportExportCapability[] = [
  {
    iconName: "Globe2",
    badge: "Global Sourcing",
    iconColor: "text-brand-blue",
    iconBg: "bg-brand-blue/15 border-brand-blue/30",
    title: "Abroad Procurement & Sourcing",
    desc: "Direct import of commercial goods, industrial machinery, IT components, and consumer commodities from partner networks across China, UAE, Southeast Asia, Europe, and the Americas.",
    category: "shipment",
  },
  {
    iconName: "Ship",
    badge: "End-to-End Freight",
    iconColor: "text-action-orange",
    iconBg: "bg-action-orange/15 border-action-orange/30",
    title: "Shipment Activities Management",
    desc: "Complete overseas logistics coordination: multi-modal ocean cargo (FCL & LCL), priority air freight, route optimization, port handling, and 24/7 real-time consignment tracking.",
    category: "shipment",
  },
  {
    iconName: "Boxes",
    badge: "Dock & Yard",
    iconColor: "text-brand-blue",
    iconBg: "bg-brand-blue/15 border-brand-blue/30",
    title: "Precision Loading & Unloading",
    desc: "Certified heavy crane and forklift cargo handling at dockyards and warehouses. Specialized palletization, fragile goods protection, and zero-breakage offloading standards.",
    category: "operations",
  },
  {
    iconName: "Truck",
    badge: "Last-Mile Fleet",
    iconColor: "text-action-orange",
    iconBg: "bg-action-orange/15 border-action-orange/30",
    title: "Doorstep Customer Delivery",
    desc: "Reliable distribution fleet ensuring prompt dispatch from ports and central hubs directly to customer warehouses, retail points, and business premises throughout Chennai & Pan-India.",
    category: "delivery",
  },
  {
    iconName: "CreditCard",
    badge: "Financial Security",
    iconColor: "text-brand-blue",
    iconBg: "bg-brand-blue/15 border-brand-blue/30",
    title: "Payment Pickup & Settlement",
    desc: "Transparent cash on delivery (COD), secure cheque collections, and real-time wire payment reconciliation with strict verification and immediate merchant account settlements.",
    category: "delivery",
  },
  {
    iconName: "TrendingUp",
    badge: "Strategic Advisory",
    iconColor: "text-action-orange",
    iconBg: "bg-action-orange/15 border-action-orange/30",
    title: "International Business Development",
    desc: "Strategic cross-border trade advisory, international vendor negotiation, duty tariff optimization, customs compliance documentation (B/L, HS Codes), and export expansion.",
    category: "operations",
  },
];

export interface ShipmentGalleryItem {
  title: string;
  subtitle: string;
  tag: string;
  image: string;
  accent: string;
}

export const shipmentGallery: ShipmentGalleryItem[] = [
  {
    title: "Ocean Cargo Freight",
    subtitle: "Large-Scale Container Shipping",
    tag: "Sea Transit",
    image:
      "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80",
    accent: "border-brand-blue/50",
  },
  {
    title: "Air Express Cargo",
    subtitle: "Time-Critical Air Shipments",
    tag: "Air Transit",
    image:
      "https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?auto=format&fit=crop&w=800&q=80",
    accent: "border-action-orange/50",
  },
  {
    title: "Palletized Warehousing",
    subtitle: "Automated Goods Storage & Safety",
    tag: "Warehouse",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    accent: "border-brand-blue/50",
  },
  {
    title: "Interstate Transport Fleet",
    subtitle: "Heavy Logistics & Delivery Fleet",
    tag: "Nationwide Transit",
    image:
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80",
    accent: "border-action-orange/50",
  },
  {
    title: "Customer Handover & COD",
    subtitle: "Verified Delivery & Payment Pickup",
    tag: "Doorstep Handover",
    image:
      "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80",
    accent: "border-brand-blue/50",
  },
];

export interface WorkflowStep {
  step: string;
  title: string;
  desc: string;
  iconName: string;
}

export const importExportWorkflowSteps: WorkflowStep[] = [
  {
    step: "01",
    title: "Abroad Sourcing & Deal Finalization",
    desc: "Identify verified manufacturers abroad, evaluate product specifications, negotiate wholesale contracts, and structure international trade finance.",
    iconName: "Globe2",
  },
  {
    step: "02",
    title: "Shipment & Customs Clearance",
    desc: "Coordinate ocean or air freight charters, process bill of lading & tariff classifications, and secure fast-track port authority approvals.",
    iconName: "Ship",
  },
  {
    step: "03",
    title: "Dock Loading & Unloading",
    desc: "Supervise heavy mechanical offloading, container de-stuffing, quality inspection, and climate-safe transfer into staging warehouses.",
    iconName: "Boxes",
  },
  {
    step: "04",
    title: "Delivery & Payment Pickup",
    desc: "Execute scheduled last-mile transport directly to client doors, verify consignment integrity, and safely collect & reconcile payment.",
    iconName: "PackageCheck",
  },
];

export interface StatHighlight {
  iconName: string;
  value: string;
  label: string;
  color: string;
  border: string;
}

export const importExportStats: StatHighlight[] = [
  {
    iconName: "Globe2",
    value: "15+ Nations",
    label: "Sourcing Corridors",
    color: "text-brand-blue",
    border: "hover:border-brand-blue/50",
  },
  {
    iconName: "Ship",
    value: "100% Insured",
    label: "Sea & Air Transit",
    color: "text-action-orange",
    border: "hover:border-action-orange/50",
  },
  {
    iconName: "Boxes",
    value: "Zero Damage",
    label: "Loading & Unloading",
    color: "text-brand-blue",
    border: "hover:border-brand-blue/50",
  },
  {
    iconName: "PackageCheck",
    value: "Direct Handover",
    label: "Delivery & Payment",
    color: "text-action-orange",
    border: "hover:border-action-orange/50",
  },
];

export type ImportExportTabId = "all" | "shipment" | "operations" | "delivery";

export const importExportTabs: { id: ImportExportTabId; label: string }[] = [
  { id: "all", label: "All Operations" },
  { id: "shipment", label: "Shipment & Sourcing" },
  { id: "operations", label: "Loading & Trade" },
  { id: "delivery", label: "Delivery & Payment" },
];
