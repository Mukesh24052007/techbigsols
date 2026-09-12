import { ServiceItem, FAQItem, Testimonial } from "@/types";

export const servicesData: ServiceItem[] = [
  {
    id: "sap-enterprise",
    title: "SAP E2E Implementation, Cloud & Certification Training",
    category: "Enterprise ERP & Career Hub",
    tagline: "10+ Years of E2E Implementation, Rollouts, Support, Integrations & 100% Placement Guarantee",
    description: "Complete SAP enterprise solutions and flagship certification training programs. Backed by 10+ years of implementation leadership across global giants like Apple, Pfizer, Sanofi, and Wipro. We provide full lifecycle implementations (Activate, ASAP, ADM), custom enhancement solutions (ABAP, UI5, Fiori, BAPIs, IDocs), cloud deployment, and comprehensive career training across 16 SAP modules with guaranteed placement support.",
    iconName: "Server",
    image: "https://nhxkqgwbiiaervkaeres.supabase.co/storage/v1/object/public/techbig/recruitment&hr-services.jpg",
    keyPoints: [
      "16 SAP Modules: FICO, SD, MM, WM, EWM, PP, QM, ATTP, APO, GRC, Security, BASIS, ABAP, HCM, Payroll & SuccessFactors",
      "10+ Years Experience in E2E Implementations, Global Rollouts & 24/7 L2/L3 Support",
      "SAP Cloud Deployment, S/4 HANA Migrations, Tibco & Kinaxis APS Integrations",
      "100% Placement Assistance Guarantee with Mock Interviews & Direct Offer Support"
    ],
    features: [
      {
        title: "Enterprise E2E Implementation & Support",
        desc: "End-to-end SDLC delivery: BRD creation, Design Documents, FS/TS, Solution Development, UT/IT/UAT, and Production Go-Live support with custom release strategies."
      },
      {
        title: "Complete 16-Module Career Curriculum",
        desc: "Hands-on real-time project practice covering all SAP modules — FICO, SD, MM, WM, EWM, PP, QM, ATTP, APO, GRC, Security, BASIS, ABAP, HCM, Payroll, and SuccessFactors."
      },
      {
        title: "SAP Cloud & 3rd Party Integrations",
        desc: "Seamless middleware connectivity with Tibco, Kinaxis, Coupa, Web Dynpro, SAP UI5, and custom OData services communicating directly to SAP Core."
      }
    ],
    ctaLabel: "Enroll in SAP Program"
  },
  {
    id: "software-development",
    title: "Application, Web & In-Demand Technical Skills",
    category: "Software & Developer Academy",
    tagline: "Custom Web, Mobile & Enterprise Software with Industry-Oriented Training",
    description: "Full-cycle application development and certified programming courses. We architect modern web applications, native Android apps, and robust enterprise software using C, C++, Java, Oracle, VB, .NET, SQL Server, DevOps, and Azure. Paired with intensive practical training courses with transparent, affordable fee structures. Download the syllabus PDF directly from each course card to review the full curriculum before enrolling.",
    iconName: "GraduationCap",
    image: "https://nhxkqgwbiiaervkaeres.supabase.co/storage/v1/object/public/techbig/training&support.jpg",
    keyPoints: [
      "Enterprise Application & Android Mobile Development",
      "Web Development, REST APIs, DevOps Pipelines & Azure Cloud Architecture",
      "In-Demand Courses: MS Office (₹5,000), Tally Prime (₹7,000), Visual Studio (₹15,000), Advanced Excel, Power BI, Tableau & SQL Server",
      "Programming Labs: C/C++ (₹8,000), Oracle DB (₹12,000), Python (₹10,000) & Hardware Networking — Syllabus PDFs available"
    ],
    features: [
      {
        title: "Full-Stack & Mobile Development",
        desc: "Turnkey software solutions built with .NET, Java, C++, Python, SQL Server, and Android, paired with modern responsive web applications."
      },
      {
        title: "11 Course Tracks with Syllabus Downloads",
        desc: "Practical career-focused learning with downloadable syllabuses: MS Office (₹5,000), Tally (₹7,000), Visual Studio (₹15,000), C/C++ (₹8,000), Oracle (₹12,000), Python (₹10,000), Advanced Excel, Power BI, Tableau, SQL Server & Hardware Networking."
      },
      {
        title: "Cloud & DevOps Architecture",
        desc: "CI/CD automation, Docker containerisation, and Microsoft Azure cloud infrastructure deployment for modern corporate environments."
      }
    ],
    ctaLabel: "Explore Software Courses"
  },
  {
    id: "hardware-amc",
    title: "System Sales, Hardware Service & AMC",
    category: "IT Infrastructure & Care",
    tagline: "Reliable, Fast & Affordable Device Care — Doorstep Service from ₹500/-",
    description: "Complete IT hardware solutions and system sales for businesses, corporate offices, and homes across Chennai (Ambattur). From chip-level laptop repairs and desktop troubleshooting to preventive Annual Maintenance Contracts (AMC) and printer/copier maintenance.",
    iconName: "Wrench",
    image: "https://nhxkqgwbiiaervkaeres.supabase.co/storage/v1/object/public/techbig/SystemSales&IT-services.jpg",
    keyPoints: [
      "Laptop & Desktop Chip-Level Troubleshooting, Screen Replacement & RAM/SSD Upgrades",
      "Genuine Windows OS Installation, Official Driver Setup, Data Backup & System Optimization",
      "Corporate & Residential Annual Maintenance Contracts (AMC) with Priority SLA Dispatch",
      "Printer & Xerox Copier Servicing, Toner Cartridge Refilling & Network Scanner Setup"
    ],
    features: [
      {
        title: "Fast Doorstep Dispatch",
        desc: "30-minute rapid technician response across Ambattur and Chennai metro areas for urgent hardware repairs."
      },
      {
        title: "Corporate AMC Contracts",
        desc: "Scheduled preventive maintenance, monthly hardware audits, guaranteed uptime SLAs, and priority replacement components."
      },
      {
        title: "Affordable Pricing from ₹500/-",
        desc: "Transparent diagnostic and labor costs starting at just ₹500/- with 100% genuine replacement spares and warranties."
      }
    ],
    ctaLabel: "Book Hardware Service"
  },
  {
    id: "travel-bookings",
    title: "Ticket Bookings & Tirupati Temple Desk",
    category: "Travel & Pilgrimage Management",
    tagline: "Ticket Bookings Made Easy — Travel Hassle-Free with TechBig Solutions",
    description: "Your single-window destination for all travel and ticketing requirements. We provide instant confirmed domestic and international flight tickets, Indian Railways train bookings with guaranteed Tatkal support, and seamless pilgrimage packages for Tirupati Balaji Temple including Special Entry Darshan (₹300 / VIP), accommodation, and Seva passes.",
    iconName: "Plane",
    image: "https://nhxkqgwbiiaervkaeres.supabase.co/storage/v1/object/public/techbig/business-consulting.png",
    keyPoints: [
      "Domestic & International Flight Tickets across all major airlines at best fares",
      "Train Ticket Booking for all classes with Emergency Tatkal assistance & instant confirmation",
      "Tirupati Balaji Temple Visit Desk: Online Darshan, ₹300 Special Entry passes & Cottage booking",
      "Dual Regional Booking Counters in Ambattur, Chennai with 24/7 customer support"
    ],
    features: [
      {
        title: "All Major Airlines Flight Bookings",
        desc: "Instant domestic & international ticketing with corporate fares, luggage assistance, and zero hidden cancellation fees."
      },
      {
        title: "Tatkal & Express Train Confirmations",
        desc: "Confirmed berths across all AC and sleeper classes for local and national routes with real-time PNR tracking."
      },
      {
        title: "Confirmed Tirupati Balaji Darshan",
        desc: "Hassle-free online slot booking for ₹300 Special Entry Darshan, temple seva passes, and TTD cottage accommodation."
      }
    ],
    ctaLabel: "Book Tickets Online"
  },
  {
    id: "hr-services",
    title: "HR Services — Domestic & Abroad Opportunities",
    category: "Recruitment & HR Services",
    tagline: "Connecting Talent with Opportunity — Locally and Globally",
    description: "TechBig Solutions bridges skilled professionals with the right employers across India and abroad. We provide end-to-end HR services covering talent acquisition, workforce placement, career counselling, and international job placement support. Whether you are a fresher stepping into the industry or an experienced professional seeking global opportunities, we guide you through every stage of the hiring journey.",
    iconName: "Users",
    image: "https://nhxkqgwbiiaervkaeres.supabase.co/storage/v1/object/public/techbig/recruitment&hr-services.jpg",
    keyPoints: [
      "Domestic Placement Services across IT, Manufacturing, Logistics & Finance sectors",
      "Abroad Job Opportunities with verified overseas employers in Gulf, Europe & Southeast Asia",
      "End-to-End Recruitment: Screening, Shortlisting, Interview Coordination & Offer Management",
      "Career Counselling, Resume Building & Pre-Departure Assistance for International Candidates"
    ],
    features: [
      {
        title: "Domestic Talent Acquisition",
        desc: "Sourcing and placing candidates for corporate, technical, and non-technical roles across Chennai, Bangalore, and major Indian cities with quick turnaround times."
      },
      {
        title: "International Job Placement",
        desc: "Verified abroad opportunities with trusted employers in the Gulf region, Europe, and Southeast Asia, including visa guidance, document verification, and pre-departure support."
      },
      {
        title: "End-to-End HR Support",
        desc: "Full-cycle recruitment management — from job profiling and candidate screening to interview scheduling, offer negotiation, and onboarding coordination."
      }
    ],
    ctaLabel: "Explore Job Opportunities"
  },
  {
    id: "real-estate",
    title: "Real Estate Services — Buy, Sell & Rent",
    category: "Property & Real Estate",
    tagline: "Your Trusted Property Partner in Bangalore & Chennai",
    description: "TechBig Solutions brings you a full-service real estate desk covering residential, commercial, and industrial property needs across Bangalore and Chennai. Whether you are buying your first home, scaling office infrastructure, leasing a warehouse, or investing in plots, our experienced property advisors guide you from initial search through legal due diligence, registration, and handover. We maintain a verified network of builders, landowners, and corporate lessors to deliver fast, transparent, and hassle-free property transactions.",
    iconName: "Building2",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
    keyPoints: [
      "Residential Sales & Rentals: Apartments, Villas, Independent Houses & Gated Communities",
      "Commercial Leasing & Sales: Office Spaces, Co-working Setups, Retail Showrooms & IT Parks",
      "Plot & Land Deals: Verified DTCP / RERA Approved Layouts with Full Encumbrance Check",
      "End-to-End Legal Support: Sale Agreement, Title Verification, Registration & Loan Tie-Ups"
    ],
    features: [
      {
        title: "Free Property Consultation",
        desc: "Dedicated advisors provide no-obligation site visit coordination, budget planning, and locality analysis tailored to your requirements."
      },
      {
        title: "RERA-Verified Listings",
        desc: "All properties are cross-checked against RERA and DTCP databases ensuring full legal compliance, clear titles, and zero encumbrance."
      },
      {
        title: "Home Loan & Registration Support",
        desc: "Tie-ups with leading banks and NBFCs for instant pre-approval, along with complete registration paperwork and stamp duty guidance."
      }
    ],
    ctaLabel: "Enquire About Properties"
  },
  {
    id: "import-export",
    title: "Global Import / Export & Shipment Logistics",
    category: "International Trade & Freight",
    tagline: "TECHBIG Solutions Owns IMPORT/EXPORT of various goods from Abroad countries",
    description: "TECHBIG Solutions owns import and export operations of various commercial goods, industrial components, and merchandise from abroad countries. We manage all shipment activities end-to-end, including foreign supplier negotiations, multi-modal ocean and air freight, port loading and unloading, secure customer delivery, COD payment pickup, and strategic international business development.",
    iconName: "Ship",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80",
    keyPoints: [
      "Import & Export of Commercial Goods, Machinery & Merchandise from Abroad Countries",
      "End-to-End Shipment Management: Ocean FCL/LCL Freight, Priority Air Cargo & Customs Clearance",
      "Mechanical & Manual Dockyard Loading/Unloading with Strict Zero-Breakage Protocols",
      "Door-to-Door Customer Delivery, On-Site Payment Pickup (COD) & Trade Business Development"
    ],
    features: [
      {
        title: "Abroad Sourcing & Shipment Management",
        desc: "Direct procurement partnerships with verified overseas suppliers, handling container freight transit, tracking, and fast-track customs documentation."
      },
      {
        title: "Professional Loading & Unloading Operations",
        desc: "Certified heavy crane and forklift cargo handling at dockyards and warehouses, palletization, and safe staging."
      },
      {
        title: "Customer Delivery, Payment Pickup & Biz Dev",
        desc: "Scheduled last-mile doorstep dispatch across Tamil Nadu & India, verified payment/COD collection, and trade market expansion."
      }
    ],
    ctaLabel: "Inquire for Import/Export"
  }
];

export const testimonialsData: Testimonial[] = [
  {
    id: "test-1",
    quote: "The SAP MM and S/4 HANA training mentored by Maheshwaran sir was truly transformative. Thanks to their interview preparation and 100% placement support, I received an offer letter as an SAP Associate Consultant within 45 days!",
    author: "Karthik Sundaram",
    role: "SAP MM Consultant",
    company: "Global IT Services MNC",
    rating: 5
  },
  {
    id: "test-2",
    quote: "We signed an Annual Maintenance Contract (AMC) with TechBig Solutions for our 35 office workstations and network printers in Ambattur. Their technicians respond in under 30 minutes, keeping downtime near zero.",
    author: "Venkatesh Raman",
    role: "Managing Director",
    company: "Precision Logistics & Manufacturing",
    rating: 5
  },
  {
    id: "test-3",
    quote: "TechBig Solutions arranged our entire family pilgrimage to Tirupati including confirmed ₹300 Special Entry Darshan passes, cottage accommodation, and round-trip train tickets during heavy festival rush. Excellent service!",
    author: "Deepa Krishna",
    role: "Devotee & Traveler",
    company: "Family Pilgrimage Booking",
    rating: 5
  }
];

export const faqsData: FAQItem[] = [
  {
    category: "SAP Training",
    question: "Which SAP modules do you offer and do you guarantee job placement?",
    answer: "We offer 16 SAP modules: FICO, SD, MM, WM, EWM, PP, QM, ATTP, APO, GRC, Security, BASIS, ABAP, HCM, Payroll, and SuccessFactors. Syllabus PDFs are available for 14 of these modules — download them directly from the course card on the home page or the services page. Yes, our programme includes 100% placement assistance with mock interviews, resume preparation, and direct offer support."
  },
  {
    category: "Software Courses",
    question: "What are the course fees and durations for programming and skill classes?",
    answer: "Course fees are fully transparent: MS Office is ₹5,000, Tally Prime is ₹7,000, C/C++ is ₹8,000, Oracle DB is ₹12,000, Visual Studio is ₹15,000, Python is ₹10,000, and Hardware & Networking is ₹8,000. Advanced Excel, Power BI, Tableau, and SQL Server fees are available on request. Most courses run 4 to 8 weeks with flexible weekend/weekday batches. Syllabus PDFs for Python, Oracle, Advanced Excel, Power BI, Tableau, and SQL Server can be downloaded directly from each course card."
  },
  {
    category: "Hardware Service",
    question: "How fast is your doorstep hardware service and what is the starting fee?",
    answer: "Our certified hardware technicians provide doorstep service across Chennai (with dedicated centers in Ambattur) with minimum service fees starting from ₹500/- onwards. Critical repairs have a 30-minute rapid dispatch."
  },
  {
    category: "Travel & Darshan",
    question: "How do you book Tirupati Special Entry Darshan and Tatkal train tickets?",
    answer: "Our 24/7 booking desk handles end-to-end devotee quota bookings for ₹300 Special Entry Darshan, Seva tickets, and TTD accommodation, as well as priority Tatkal train tickets and domestic/international flights with instant confirmation."
  },
  {
    category: "Real Estate",
    question: "What types of properties do you help buy, sell, or rent?",
    answer: "We assist with residential apartments, independent houses, commercial office spaces, plots, and warehouses across Bangalore and Chennai. Our advisors provide free consultation, legal document verification, and end-to-end transaction support for both buyers and sellers."
  }
];
