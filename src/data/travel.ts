// Data for TravelBookingsSection

export interface TravelTrustBadge {
  iconName: string;
  iconColor: string;
  title: string;
  subtitle: string;
}

export const travelTrustBadges: TravelTrustBadge[] = [
  {
    iconName: "ShieldCheck",
    iconColor: "text-brand-blue",
    title: "Safe & Secure Bookings",
    subtitle: "100% verified ticketing",
  },
  {
    iconName: "Percent",
    iconColor: "text-action-orange",
    title: "Best Prices Guaranteed",
    subtitle: "Exclusive discounts",
  },
  {
    iconName: "Headphones",
    iconColor: "text-emerald-600",
    title: "24/7 Customer Support",
    subtitle: "Live booking assistance",
  },
  {
    iconName: "Clock",
    iconColor: "text-purple-600",
    title: "Instant Confirmation",
    subtitle: "Direct SMS & WhatsApp",
  },
];

export interface TravelServicePoint {
  title: string;
  detail: string;
}

export interface TravelService {
  id: string;
  iconName: string;
  iconBgClass: string;
  iconHoverBgClass: string;
  badgeLabel: string;
  badgeClass: string;
  title: string;
  tagline: string;
  points: TravelServicePoint[];
  ctaLabel: string;
  ctaQuoteLabel: string;
  ctaClass: string;
  featured?: boolean;
}

export const travelServices: TravelService[] = [
  {
    id: "flight",
    iconName: "Plane",
    iconBgClass: "bg-blue-50 text-blue-600",
    iconHoverBgClass: "group-hover:bg-blue-600 group-hover:text-white",
    badgeLabel: "Airlines",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-100",
    title: "Flight Ticket Booking",
    tagline: "All Major Airlines • Best Fares • Easy Booking",
    points: [
      {
        title: "Domestic Flight Ticket Booking",
        detail:
          "Indigo, Air India, SpiceJet & Akasa with lowest cancellation fees.",
      },
      {
        title: "International Flight Ticket Booking",
        detail:
          "Global itineraries, transit visa assistance & group discounts.",
      },
      {
        title: "Corporate & Group Fares",
        detail:
          "Special corporate concession codes and flexible reschedule options.",
      },
    ],
    ctaLabel: "Book Flight Tickets",
    ctaQuoteLabel: "Flight Ticket Booking",
    ctaClass:
      "bg-blue-50 hover:bg-brand-blue hover:text-white text-brand-blue",
  },
  {
    id: "train",
    iconName: "Train",
    iconBgClass: "bg-emerald-50 text-emerald-600",
    iconHoverBgClass: "group-hover:bg-emerald-600 group-hover:text-white",
    badgeLabel: "Railways",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-100",
    title: "Train Ticket Booking",
    tagline: "All Classes • Tatkal Booking • Instant Confirmation",
    points: [
      {
        title: "Local Train Ticket Booking",
        detail:
          "Daily express & regional passenger tickets with zero counter queue.",
      },
      {
        title: "National Train Ticket Booking",
        detail:
          "Vande Bharat, Rajdhani, Shatabdi across all berths & AC tiers.",
      },
      {
        title: "Emergency Tatkal & Premium Tatkal",
        detail:
          "Dedicated assistance for urgent peak-season travel confirmations.",
      },
    ],
    ctaLabel: "Book Train / Tatkal",
    ctaQuoteLabel: "Train Ticket Booking (Tatkal / Regular)",
    ctaClass:
      "bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700",
  },
  {
    id: "tirupati",
    iconName: "Landmark",
    iconBgClass: "bg-amber-50 text-action-orange",
    iconHoverBgClass: "group-hover:bg-action-orange group-hover:text-white",
    badgeLabel: "Popular Seva",
    badgeClass: "",
    title: "Tirupati Temple Visit Booking",
    tagline: "Hassle-Free Darshan • Confirmed Booking",
    points: [
      {
        title: "Tirupati Darshan Online Booking",
        detail:
          "Official slot booking assistance with verified devotee details.",
      },
      {
        title: "Special Entry Darshan (₹300 / VIP)",
        detail:
          "Confirmed quick-access passes for effortless family temple darshan.",
      },
      {
        title: "Accommodation & Seva Tickets",
        detail:
          "Tirumala cottages, guesthouse reservation & morning Suprabhatha Seva.",
      },
    ],
    ctaLabel: "Book Tirupati Darshan",
    ctaQuoteLabel: "Tirupati Temple Darshan Booking",
    ctaClass: "bg-action-orange hover:bg-orange-600 text-white",
    featured: true,
  },
];
