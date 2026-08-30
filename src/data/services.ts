import { ServiceItem, FAQItem, Testimonial } from "@/types";

export const servicesData: ServiceItem[] = [
  {
    id: "recruitment-hr",
    title: "Recruitment & HR Services",
    category: "Talent Acquisition",
    tagline: "Building High-Performance Teams with Targeted Talent Acquisition",
    description: "Scale your team with precision. We provide end-to-end recruitment solutions, from sourcing top-tier technical talent to managing human resources infrastructure, ensuring your workforce aligns with your strategic objectives.",
    iconName: "Users",
    image: "https://nhxkqgwbiiaervkaeres.supabase.co/storage/v1/object/public/techbig/recruitment&hr-services.jpg",
    keyPoints: [
      "Executive Search & Niche Technical Recruiting",
      "End-to-End HR Compliance & Payroll Management",
      "Candidate Vetting with Technical Skill Assessments",
      "Scalable Contract & Permanent Staffing Models"
    ],
    features: [
      {
        title: "Technical Talent Sourcing",
        desc: "Access a vetted talent pool of senior developers, cloud architects, project managers, and security professionals."
      },
      {
        title: "HR Infrastructure & Compliance",
        desc: "Complete onboarding pipelines, legal compliance, wage restructuring, and benefits management customized for Indian and global enterprises."
      },
      {
        title: "Retained Executive Search",
        desc: "Discreet and targeted search strategies for C-suite and VP-level technology leadership roles."
      }
    ],
    ctaLabel: "Explore HR Solutions"
  },
  {
    id: "it-services",
    title: "System Sales & IT Services",
    category: "Infrastructure",
    tagline: "Reliable Infrastructure, Seamless Integration, and Proactive Managed Services",
    description: "Modernize your operations with robust IT infrastructure. We supply enterprise-grade hardware, cloud solutions, and comprehensive managed IT services to keep your systems secure, efficient, and resilient.",
    iconName: "Server",
    image: "https://nhxkqgwbiiaervkaeres.supabase.co/storage/v1/object/public/techbig/SystemSales&IT-services.jpg",
    keyPoints: [
      "Enterprise Hardware Procurement & Custom Rig Deployment",
      "Managed IT Support & Cloud Infrastructure Migration",
      "Enterprise Cyber Security, Firewalls & Zero Trust Networking",
      "Preventive System Maintenance & 24/7 SLA Monitoring"
    ],
    features: [
      {
        title: "Enterprise Hardware Deployment",
        desc: "Turnkey workstation setups, server racks, high-throughput network switches, and uninterruptible power systems."
      },
      {
        title: "Cloud & Hybrid Migrations",
        desc: "Seamless transition to AWS, Azure, or private cloud environments with zero operational downtime."
      },
      {
        title: "Cybersecurity & Business Continuity",
        desc: "Automated off-site backups, disaster recovery plans, endpoint detection, and proactive security audits."
      }
    ],
    ctaLabel: "View IT Services"
  },
  {
    id: "training-support",
    title: "Training & Support Services",
    category: "Empowerment",
    tagline: "Empowering Your Workforce with Continuous Learning & 24/7 Assistance",
    description: "Maximize ROI on your technology investments. Our comprehensive training programs and 24/7 technical support ensure your team is proficient, productive, and supported at every turn.",
    iconName: "GraduationCap",
    image: "https://nhxkqgwbiiaervkaeres.supabase.co/storage/v1/object/public/techbig/training&support.jpg",
    keyPoints: [
      "Corporate Technology Upskilling & Certification Workshops",
      "24/7 Dedicated Multi-Tier Helpdesk Support",
      "Software Adoption & Systems Workflow Training",
      "Custom LMS Course Development for Internal Teams"
    ],
    features: [
      {
        title: "Hands-On Technical Workshops",
        desc: "Interactive curriculum covering modern DevOps, Cloud tooling, Cyber hygiene, and Enterprise CRM/ERP systems."
      },
      {
        title: "Tier 1-3 Helpdesk Support",
        desc: "Rapid incident response via live ticketing, phone, and on-site dispatch guarantees 99.9% resolution metrics."
      },
      {
        title: "Post-Implementation Enablement",
        desc: "Ensure 100% staff adoption after rolling out new IT platforms or operational software."
      }
    ],
    ctaLabel: "Discover Training"
  },
  {
    id: "business-consulting",
    title: "Business Consulting & Transformation",
    category: "Strategy",
    tagline: "Strategic Insights to Navigate Complex Market Dynamics",
    description: "Transform your operational strategy. Our seasoned consultants analyze your business processes to identify bottlenecks, integrate new technologies, and construct actionable roadmaps for sustainable growth.",
    iconName: "TrendingUp",
    image: "https://nhxkqgwbiiaervkaeres.supabase.co/storage/v1/object/public/techbig/business-consulting.png",
    keyPoints: [
      "Digital Transformation Roadmaps & ROI Analysis",
      "Business Process Re-engineering & Workflow Automation",
      "Technology Stack Auditing & Cost Optimization",
      "Enterprise Change Management & Risk Mitigation"
    ],
    features: [
      {
        title: "Digital Process Auditing",
        desc: "Pinpoint inefficiencies, eliminate data silos, and automate repetitive operational bottlenecks across your teams."
      },
      {
        title: "Tech Stack Modernization",
        desc: "Reduce licensing overhead and technical debt by upgrading legacy architectures to lightweight modern cloud solutions."
      },
      {
        title: "Growth & Scaling Strategy",
        desc: "Custom strategic frameworks tailored for mid-market and enterprise companies looking to expand footprint."
      }
    ],
    ctaLabel: "Consult with Experts"
  }
];

export const testimonialsData: Testimonial[] = [
  {
    id: "test-1",
    quote: "TechBigSolutions overhauled our entire server infrastructure and recruited 12 critical engineers for our platform. Their technical precision and speed are unmatched.",
    author: "Rajesh Sharma",
    role: "Chief Technology Officer",
    company: "NexGen Financial Cloud",
    rating: 5
  },
  {
    id: "test-2",
    quote: "The 24/7 IT support and employee training programs drastically cut down our internal support tickets by 60% in the first 90 days. Exceptional partner!",
    author: "Priya Varma",
    role: "VP of People & Operations",
    company: "Apex Healthcare Systems",
    rating: 5
  },
  {
    id: "test-3",
    quote: "Their business consulting team identified over $120K in software licensing redundancies and mapped out an actionable digital roadmap that drove 40% growth.",
    author: "Anand Kulkarni",
    role: "Managing Director",
    company: "Horizon Retail Logistics",
    rating: 5
  }
];

export const faqsData: FAQItem[] = [
  {
    category: "Services",
    question: "What types of industries does TechBigSolutions support?",
    answer: "We support a wide array of industries including Financial Services, Healthcare, E-Commerce, Manufacturing, IT/SaaS startups, and Enterprise Logistics with customized technology stacks and talent recruitment."
  },
  {
    category: "Services",
    question: "How fast can you deploy emergency on-site IT support?",
    answer: "Our enterprise SLA guarantees response times under 15 minutes for critical severity incidents, with rapid on-site dispatch available across metro operational centers."
  },
  {
    category: "Products",
    question: "Do your hardware products come with warranty and support?",
    answer: "Yes! All hardware units and accessories come with standard manufacturer warranties, and enterprise workstations include our 3-year Next Business Day on-site replacement warranty."
  },
  {
    category: "Recruitment",
    question: "How do you vet technical talent before candidate presentation?",
    answer: "Candidates undergo rigorous multi-stage evaluations including live coding benchmarks, architectural problem-solving assessments, and verified background/culture fit checks."
  },
  {
    category: "Consulting",
    question: "How does the initial consultation process work?",
    answer: "We conduct a complimentary 45-minute discovery workshop to understand your current pain points, followed by a detailed diagnostic report with tangible milestones and ROI estimates."
  }
];
