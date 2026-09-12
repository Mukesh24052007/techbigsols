// Data for MeetTheTeamSection

export interface ExperienceCard {
  roleLabel: string;
  company: string;
  companyBadgeColor: string;
  title: string;
  description: string;
}

export const founderExperienceCards: ExperienceCard[] = [
  {
    roleLabel: "Lead Consultant (SAP MM HANA)",
    company: "Wipro / Apple",
    companyBadgeColor: "text-amber-300",
    title: "Apple Computers — Retail & ER Solutions",
    description:
      "Led SAP core enhancement requirements, Assortment DB (ADB), PAM tools, Unibox, Web Dynpro, UI5, and OData integration to SAP Core.",
  },
  {
    roleLabel: "Lead SAP Consultant (MM / WM)",
    company: "Accenture",
    companyBadgeColor: "text-amber-300",
    title: "Pfizer & Sanofi — Global Pharma Rollouts",
    description:
      "E2E rollout across 65 countries (eBuy / Coupa integration, Tibco middleware), Sanofi SCCore S/4 HANA Kinaxis integration, and Zoetis merger.",
  },
  {
    roleLabel: "Overseas IT Manager",
    company: "PNG / Overseas",
    companyBadgeColor: "text-emerald-300",
    title: "John J & H Seeto & Pacific Industries",
    description:
      "Directed large-scale ERP rollouts (SAP MM, QuickBooks Pro, PAYPAC, WMS, logistics) managing IT infrastructure for over 2,000+ business users.",
  },
  {
    roleLabel: "Technical Pedigree",
    company: "Mentorship",
    companyBadgeColor: "text-purple-300",
    title: "Software Engineering & ACT Faculty",
    description:
      "Deep technical background in ABAP debugging, .NET, C/C++, database administration, with years of teaching experience empowering young engineers.",
  },
];

export const founderMethodologies: string[] = [
  "SAP Activate (Agile)",
  "ASAP Methodology",
  "Accenture Delivery (ADM)",
  "Waterfall",
  "Solman & Soldoc",
  "RevTrack & ChaRM",
];

export interface FounderInfo {
  initials: string;
  name: string;
  designation: string;
  certificationLabel: string;
  education: string;
  phone: string;
  email: string;
  location: string;
  experienceSummary: string;
  experienceTag: string;
}

export const founderInfo: FounderInfo = {
  initials: "MA",
  name: "Maheshwaran Adinarayanan",
  designation: "Founder & Principal SAP Consultant",
  certificationLabel: "SAP Certified Consultant",
  education: "B.Sc. (CS) • MBA (Banking & Finance) • Executive MBA (NIBM)",
  phone: "(+91) 8122196279 / 8122348442",
  email: "techbigsolutions@gmail.com",
  location: "Ambattur, Chennai, India",
  experienceSummary:
    "With over 17 years of domestic and international IT leadership, Maheshwaran has delivered mission-critical SAP (MM, WM) ECC 6.0 and S/4 HANA end-to-end implementations, global rollouts across 65+ countries, and high-volume enterprise enhancements for world-leading corporations.",
  experienceTag: "17+ Years IT Experience • 9+ Years in SAP S/4 HANA",
};
