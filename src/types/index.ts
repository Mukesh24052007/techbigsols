export interface Product {
  id: string;
  name: string;
  /** Free-form category string matching the backend schema (e.g. "Electronics", "Accessories", …) */
  category: string;
  price: number;
  rating: number;
  reviewsCount?: number;
  badge?: string;
  image: string;
  shortDescription: string;
  description: string;
  /** Specs stored as a key→value map internally; converted to/from { key, value }[] on the wire */
  specs: { [key: string]: string };
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  tagline: string;
  description: string;
  iconName: string;
  image: string;
  keyPoints: string[];
  features: { title: string; desc: string }[];
  ctaLabel: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  rating: number;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

// ─── User / Portal Types ───────────────────────────────────────────────────

export const MODULE_KEYS = [
  "attendance",
  "assetMaster",
  "productMaster",
  "employeeMaster",
  "payrollSheet",
  "accountsModule",
  "inventoryReport",
  "profitAndLoss",
  "balanceSheet",
  "trialBalance",
] as const;

export type ModuleKey = (typeof MODULE_KEYS)[number];

export const MODULE_LABELS: Record<ModuleKey, string> = {
  attendance: "Attendance",
  assetMaster: "Asset Master",
  productMaster: "Product Master",
  employeeMaster: "Employee Master",
  payrollSheet: "Payroll Sheet",
  accountsModule: "Accounts Module",
  inventoryReport: "Inventory Report",
  profitAndLoss: "Profit & Loss",
  balanceSheet: "Balance Sheet",
  trialBalance: "Trial Balance",
};

export type ModulePermissions = Record<ModuleKey, boolean>;

export interface PortalUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  permissions: ModulePermissions;
  isActive: boolean;
  createdAt: string;
}

/** Safe version (no passwordHash) sent to clients */
export type PortalUserPublic = Omit<PortalUser, "passwordHash">;
