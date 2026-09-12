// Data for HardwareServicesSection

export interface HardwareService {
  id: string;
  title: string;
  iconName: string;
  description: string;
  items: string[];
  popular?: boolean;
}

export const hardwareServices: HardwareService[] = [
  {
    id: "laptop-service",
    title: "LAPTOP SERVICE",
    iconName: "Laptop",
    description:
      "End-to-end chip-level & component diagnostics for all major brands (Dell, HP, Lenovo, Apple, Asus, Acer).",
    items: [
      "Screen & Display Replacement",
      "Keyboard & Trackpad Repair",
      "Battery Issues & Charger Port Fixes",
      "Overheating, Thermal Paste & Fan Cleaning",
      "Slow Performance & SSD / RAM Upgrades",
    ],
    popular: true,
  },
  {
    id: "os-software",
    title: "OS & SOFTWARE INSTALLATION",
    iconName: "HardDrive",
    description:
      "Clean, licensed operating system installations, essential utility drivers, and enterprise system optimization.",
    items: [
      "Genuine Windows OS Installation & Activation",
      "Official Driver Setup & Motherboard Bios Updates",
      "Business & Productivity Software Installation",
      "Secure Data Backup & Full System Migration",
      "Performance Optimization & Bloatware Removal",
    ],
  },
  {
    id: "amc",
    title: "ANNUAL MAINTENANCE CONTRACT (AMC)",
    iconName: "ShieldCheck",
    description:
      "Proactive, worry-free maintenance packages for offices, commercial workspaces, schools, and homes.",
    items: [
      "Scheduled Monthly Preventive Maintenance",
      "Regular System Health Checkups & Diagnostics",
      "Priority Same-Day Doorstep Support Dispatch",
      "Significant Long-Term Cost Savings on Spares",
      "Dedicated Enterprise SLA & Remote Assistance",
    ],
    popular: true,
  },
  {
    id: "desktop-service",
    title: "DESKTOP SERVICE",
    iconName: "Monitor",
    description:
      "Complete workstation repair, custom PC builds, SMPS power unit fixes, and motherboard repairs.",
    items: [
      "Component-Level Hardware Troubleshooting",
      "Motherboard & SMPS Power Supply Replacement",
      "Malware, Ransomware & Virus Removal",
      "Gaming / Rendering Rig Upgrades & Assembly",
      "Comprehensive Speed & Performance Tuning",
    ],
  },
  {
    id: "printer-xerox",
    title: "PRINTER & XEROX SERVICE",
    iconName: "Printer",
    description:
      "Reliable commercial and home printer repair, toner cartridge refilling, and network scanner integration.",
    items: [
      "Printer Installation & Wireless Network Driver Setup",
      "Paper Jam Removal & Roller Mechanism Repair",
      "LaserJet & Ink Tank Toner Cartridge Refilling",
      "Head Cleaning & Print Quality Troubleshooting",
      "Heavy-Duty Xerox & Multifunction Copier Servicing",
    ],
  },
];

export interface HardwareTrustPoint {
  title: string;
  desc: string;
}

export const hardwareTrustPoints: HardwareTrustPoint[] = [
  {
    title: "Experienced Technicians",
    desc: "Skilled & certified hardware professionals",
  },
  {
    title: "Quick Response",
    desc: "Fast doorstep service at your convenience",
  },
  {
    title: "Genuine Parts",
    desc: "Original spares for long-lasting performance",
  },
  {
    title: "Affordable Prices",
    desc: "Transparent rates starting from ₹500 onwards",
  },
  {
    title: "On-Site Support",
    desc: "We come to you anywhere, anytime",
  },
];
