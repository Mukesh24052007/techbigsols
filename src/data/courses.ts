// Data for TechCoursesSection

export interface SkillCourse {
  id: string;
  name: string;
  price: string;
  tagline: string;
  topics: string[];
  iconName: string;
  popular?: boolean;
}

export const skillCourses: SkillCourse[] = [
  {
    id: "ms-office",
    name: "MS OFFICE",
    price: "₹ 5,000",
    tagline: "Word • Excel • PowerPoint",
    topics: ["Advanced Formulas", "Pivot Tables", "Productivity"],
    iconName: "FileSpreadsheet",
  },
  {
    id: "advanced-excel",
    name: "ADVANCED EXCEL",
    price: "On Request",
    tagline: "Data Analysis & Dashboards",
    topics: ["Power Query & Power Pivot", "Dynamic Charts & Macros", "VBA Automation"],
    iconName: "FileSpreadsheet",
    popular: true,
  },
  {
    id: "tally",
    name: "TALLY PRIME",
    price: "₹ 7,000",
    tagline: "Accounting & GST",
    topics: ["GST Filing & E-Way Bills", "Inventory", "Payroll"],
    iconName: "Calculator",
    popular: true,
  },
  {
    id: "visual-studio",
    name: "VISUAL STUDIO",
    price: "₹ 15,000",
    tagline: ".NET & Enterprise C#",
    topics: ["Code, Debug & Deploy", "Windows/Web Apps", "DB Integration"],
    iconName: "Code",
  },
  {
    id: "c-cpp",
    name: "C / C++ CODING",
    price: "₹ 8,000",
    tagline: "Core Programming",
    topics: ["High-Performance Logic", "Data Structures", "Algorithms"],
    iconName: "Terminal",
  },
  {
    id: "oracle",
    name: "ORACLE DATABASE",
    price: "₹ 12,000",
    tagline: "SQL & Administration",
    topics: ["PL/SQL Triggers", "DB Architecture", "Performance"],
    iconName: "Database",
  },
  {
    id: "sql-server",
    name: "SQL SERVER",
    price: "On Request",
    tagline: "Microsoft SQL & T-SQL",
    topics: ["T-SQL Queries & Stored Procs", "SSRS / SSIS Reporting", "DB Admin & Tuning"],
    iconName: "Server",
  },
  {
    id: "python",
    name: "PYTHON DEV",
    price: "₹ 10,000",
    tagline: "Automation & Projects",
    topics: ["Core OOP", "Web Scraping", "Real-World APIs"],
    iconName: "Cpu",
    popular: true,
  },
  {
    id: "power-bi",
    name: "POWER BI",
    price: "On Request",
    tagline: "Business Intelligence",
    topics: ["DAX Measures & KPIs", "Live Dashboards", "Power Query ETL"],
    iconName: "BarChart2",
    popular: true,
  },
  {
    id: "tableau",
    name: "TABLEAU",
    price: "On Request",
    tagline: "Visual Analytics",
    topics: ["Interactive Dashboards", "Calculated Fields", "Data Blending"],
    iconName: "Table2",
  },
  {
    id: "hardware-networking",
    name: "HARDWARE & NETWORK",
    price: "₹ 8,000",
    tagline: "Lab & Diagnostics",
    topics: ["PC Assembly", "LAN/WAN Configuration", "Troubleshooting"],
    iconName: "Network",
  },
];
