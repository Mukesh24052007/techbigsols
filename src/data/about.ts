// Data for AboutPage

export interface AboutValue {
  iconName: string;
  iconBg: string;
  title: string;
  description: string;
}

export const aboutValues: AboutValue[] = [
  {
    iconName: "Award",
    iconBg: "bg-amber-100 text-action-orange",
    title: "Excellence",
    description:
      "Unyielding quality standards in every hardware deployment and line of code.",
  },
  {
    iconName: "Lightbulb",
    iconBg: "bg-blue-100 text-brand-blue",
    title: "Innovation",
    description:
      "Continuous technology evolution to keep our enterprise clients ahead of the curve.",
  },
  {
    iconName: "Handshake",
    iconBg: "bg-emerald-100 text-emerald-600",
    title: "Integrity",
    description:
      "Transparent partnerships and honest SLAs built on deep professional trust.",
  },
];

export interface AboutTeamBullet {
  text: string;
}

export const aboutTeamBullets: AboutTeamBullet[] = [
  {
    text: "Continuous multi-vendor certifications (AWS, Microsoft, Cisco, Linux).",
  },
  {
    text: "High-speed testing labs for enterprise stress tests and network simulations.",
  },
  {
    text: "Sustainable, compliant, and scalable IT infrastructure practices.",
  },
];
