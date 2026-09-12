// Data for RealEstateSection

export interface PropertyHighlight {
  label: string;
  detail: string;
}

export interface PropertyType {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  accentColor: string;
  badgeLabel: string;
  highlights: PropertyHighlight[];
  ctaLabel: string;
  ctaService: string;
  featured?: boolean;
}

export const propertyTypes: PropertyType[] = [
  {
    id: "residential",
    title: "Residential Properties",
    subtitle: "Apartments, Villas & Independent Houses",
    iconName: "Home",
    accentColor: "brand-blue",
    badgeLabel: "Most Popular",
    highlights: [
      {
        label: "BHK Apartments & Gated Communities",
        detail:
          "1, 2 & 3 BHK flats in RERA-approved projects with amenities across Bangalore & Chennai.",
      },
      {
        label: "Villas & Independent Houses",
        detail:
          "Plot-attached constructions, duplex homes and row houses for long-term ownership.",
      },
      {
        label: "Ready-to-Move & Under-Construction",
        detail:
          "Immediate possession options and early-bird pricing on new launches with builder tie-ups.",
      },
    ],
    ctaLabel: "Find Residential Properties",
    ctaService: "Residential Property Enquiry",
    featured: true,
  },
  {
    id: "commercial",
    title: "Commercial Spaces",
    subtitle: "Offices, Showrooms & IT Parks",
    iconName: "Briefcase",
    accentColor: "action-orange",
    badgeLabel: "For Businesses",
    highlights: [
      {
        label: "Office Spaces & Co-working",
        detail:
          "Furnished and bare-shell offices in prime business districts, IT corridors and tech parks.",
      },
      {
        label: "Retail Showrooms & Shops",
        detail:
          "High-footfall commercial ground-floor units and mall spaces with flexible lease terms.",
      },
      {
        label: "Warehouses & Industrial Sheds",
        detail:
          "Industrial zones, logistics hubs and manufacturing sheds with highway access.",
      },
    ],
    ctaLabel: "Explore Commercial Spaces",
    ctaService: "Commercial Property Enquiry",
  },
  {
    id: "plots",
    title: "Plots & Land",
    subtitle: "RERA / DTCP Approved Layouts",
    iconName: "Landmark",
    accentColor: "emerald",
    badgeLabel: "Investment Ready",
    highlights: [
      {
        label: "Approved Residential Plots",
        detail:
          "DTCP and RERA compliant plots with clear titles, encumbrance certificates and paved roads.",
      },
      {
        label: "Agricultural & Farm Land",
        detail:
          "Verified farm lands with EC, Patta, and mutation records for pucca investment.",
      },
      {
        label: "Commercial & Industrial Land",
        detail:
          "Zoned commercial parcels near highways and industrial estates for long-term development.",
      },
    ],
    ctaLabel: "Browse Approved Plots",
    ctaService: "Plot & Land Enquiry",
  },
];

export interface RealEstateTrustBadge {
  iconName: string;
  iconColor: string;
  title: string;
  sub: string;
}

export const realEstateTrustBadges: RealEstateTrustBadge[] = [
  {
    iconName: "BadgeCheck",
    iconColor: "text-brand-blue",
    title: "RERA Verified Listings",
    sub: "Zero encumbrance properties",
  },
  {
    iconName: "ShieldCheck",
    iconColor: "text-emerald-600",
    title: "Clear Title Guarantee",
    sub: "Full legal due diligence",
  },
  {
    iconName: "Key",
    iconColor: "text-action-orange",
    title: "End-to-End Support",
    sub: "From search to registration",
  },
  {
    iconName: "MapPin",
    iconColor: "text-purple-600",
    title: "Bangalore & Chennai",
    sub: "Pan-city property network",
  },
];

export interface RealEstateSupportItem {
  iconName: string;
  iconBg: string;
  title: string;
  description: string;
}

export const realEstateSupportItems: RealEstateSupportItem[] = [
  {
    iconName: "ShieldCheck",
    iconBg: "bg-brand-blue/10 text-brand-blue",
    title: "Legal Documentation Support",
    description:
      "Sale agreement drafting, title deed verification, encumbrance certificate checks, and complete stamp duty & registration guidance handled end-to-end.",
  },
  {
    iconName: "Building2",
    iconBg: "bg-action-orange/10 text-action-orange",
    title: "Home Loan & Bank Tie-Ups",
    description:
      "Pre-approved home loan assistance with leading nationalized banks and NBFCs. Minimum documentation, quick sanction, and EMI calculation support.",
  },
];
