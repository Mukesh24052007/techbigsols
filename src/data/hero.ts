// Data for HeroSection

export const heroTechStackBadges: string[] = [
  "C",
  "C++",
  "Java",
  "Oracle",
  "VB",
  ".NET",
  "SQL Server",
  "DevOps",
  "Azure",
];

export interface HeroCapabilityItem {
  iconName: string;
  title: string;
  description: string;
}

export const heroCapabilities: HeroCapabilityItem[] = [
  {
    iconName: "Laptop",
    title: "System Sales & Service",
    description: "Complete Laptop & Desktop Sales, Upgrades & Repairs",
  },
  {
    iconName: "Globe",
    title: "Website Development",
    description: "High-Performance Portals, Responsive Web & E-Commerce",
  },
  {
    iconName: "Cpu",
    title: "Hardware & Networking",
    description: "LAN/WAN Setup, AMC Maintenance & Device Architecture",
  },
  {
    iconName: "Smartphone",
    title: "Application & Android Dev",
    description: "Custom Mobile, Enterprise Software & Cloud Workflows",
  },
];

export interface HeroServiceLink {
  href: string;
  dotColor: string;
  title: string;
  subtitle: string;
}

export const heroServiceLinks: HeroServiceLink[] = [
  {
    href: "#sap-training",
    dotColor: "bg-blue-400",
    title: "SAP Training & Global Certification",
    subtitle: "10 Modules • 100% Placement Assistance",
  },
  {
    href: "#tech-courses",
    dotColor: "bg-emerald-400",
    title: "In-Demand IT & Software Skills",
    subtitle: "MS Office, Tally, Python, C++, Oracle & VS",
  },
  {
    href: "#hardware-services",
    dotColor: "bg-action-orange",
    title: "Hardware Service & AMC Support",
    subtitle: "Laptop, Desktop, OS & Printers from ₹500/-",
  },
  {
    href: "#travel-bookings",
    dotColor: "bg-purple-400",
    title: "Ticket Bookings (Flight, Train, Tirupati)",
    subtitle: "Tatkal Rail, Domestic/Intl Flights & Darshan",
  },
];

export interface HeroBranchInfo {
  name: string;
  country: string;
  contactName: string;
  address: string;
  addressLine2: string;
}

export const heroBranchInfo: HeroBranchInfo = {
  name: "Papua New Guinea",
  country: "PNG",
  contactName: "SHERINA MOKA",
  address: "C/- St Clares Parish, Ialibu, Mendi",
  addressLine2: "Southern Highlands Province 251, Papua New Guinea",
};
