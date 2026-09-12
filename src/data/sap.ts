// Data for SapTrainingSection

export interface SapModuleSummary {
  id: string;
  code: string;
  name: string;
  category: string;
  iconName: string;
  tag: string;
}

export const sapModulesList: SapModuleSummary[] = [
  {
    id: "sap-fico",
    code: "SAP FICO",
    name: "Financial & Controlling",
    category: "Functional",
    iconName: "Coins",
    tag: "Finance & Accounting",
  },
  {
    id: "sap-sd",
    code: "SAP SD",
    name: "Sales & Distribution",
    category: "Functional",
    iconName: "Truck",
    tag: "Order-to-Cash (O2C)",
  },
  {
    id: "sap-mm",
    code: "SAP MM",
    name: "Materials Management",
    category: "Functional",
    iconName: "Boxes",
    tag: "Procure-to-Pay (P2P)",
  },
  {
    id: "sap-wm",
    code: "SAP WM",
    name: "Warehouse Management",
    category: "Functional",
    iconName: "Layers",
    tag: "Storage & Bin Control",
  },
  {
    id: "sap-ewm",
    code: "SAP EWM",
    name: "Extended Warehouse",
    category: "Functional",
    iconName: "Truck",
    tag: "Next-Gen Logistics",
  },
  {
    id: "sap-pp",
    code: "SAP PP",
    name: "Production Planning",
    category: "Functional",
    iconName: "Factory",
    tag: "Manufacturing & MRP",
  },
  {
    id: "sap-qm",
    code: "SAP QM",
    name: "Quality Management",
    category: "Functional",
    iconName: "FlaskConical",
    tag: "Inspection & Compliance",
  },
  {
    id: "sap-attp",
    code: "SAP ATTP",
    name: "Advanced Track & Trace",
    category: "Functional",
    iconName: "Radio",
    tag: "Serialisation & Compliance",
  },
  {
    id: "sap-apo",
    code: "SAP APO",
    name: "Advanced Planning & Optimisation",
    category: "Functional",
    iconName: "Cog",
    tag: "Supply Chain Planning",
  },
  {
    id: "sap-security",
    code: "SAP SECURITY",
    name: "Roles & Authorisations",
    category: "Security",
    iconName: "ShieldAlert",
    tag: "S/4HANA Access Control",
  },
  {
    id: "sap-basis",
    code: "SAP BASIS",
    name: "System Administration",
    category: "Technical",
    iconName: "Database",
    tag: "HANA Cloud & NetWeaver",
  },
  {
    id: "sap-abap",
    code: "SAP ABAP",
    name: "Programming & Dev",
    category: "Technical",
    iconName: "Cpu",
    tag: "Reports, BAPIs & Fiori",
  },
  {
    id: "sap-hr",
    code: "SAP HCM",
    name: "Human Capital Management",
    category: "Functional",
    iconName: "Users",
    tag: "Workforce & Payroll",
  },
  {
    id: "sap-payroll",
    code: "SAP PAYROLL",
    name: "Payroll Processing",
    category: "Functional",
    iconName: "Coins",
    tag: "India & Global Payroll",
  },
];

export const SAP_INITIAL_VISIBLE = 8;

export interface SapPillar {
  iconName: string;
  title: string;
  subtitle: string;
}

export const sapPillars: SapPillar[] = [
  {
    iconName: "Briefcase",
    title: "100% Placement Support",
    subtitle: "Offer letter & interview prep",
  },
  {
    iconName: "Award",
    title: "Certification Support",
    subtitle: "Official global exam prep",
  },
  {
    iconName: "GraduationCap",
    title: "Expert Trainers",
    subtitle: "Apple & Accenture leads",
  },
  {
    iconName: "CheckCircle2",
    title: "Real-Time Projects",
    subtitle: "Live ticket & blueprint labs",
  },
];
