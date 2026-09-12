// Data for TestimonialsSection
// (Also re-exported in services.ts as testimonialsData — this is the canonical source
//  for the home section's richer TestimonialItem shape.)

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  companyOrCategory: string;
  rating: number;
  tag: string;
}

export const clientTestimonials: TestimonialItem[] = [
  {
    id: "test-sap",
    quote:
      "The SAP MM and S/4 HANA training mentored by Maheshwaran sir was truly eye-opening. He teaches with real-world scenarios from Apple and Accenture projects. Thanks to their interview preparation and 100% placement support, I received an offer letter as an SAP Associate Consultant within 45 days of course completion!",
    author: "Karthik Sundaram",
    role: "SAP MM Consultant",
    companyOrCategory: "Placed at Global IT Services MNC",
    rating: 5,
    tag: "SAP Training Graduate",
  },
  {
    id: "test-hardware",
    quote:
      "We signed an Annual Maintenance Contract (AMC) with TechBig Solutions for our 35 office workstations and network printers in Ambattur. Their technicians respond in under 30 minutes for doorstep support, and preventive checkups keep our downtime close to zero. Truly reliable and affordable!",
    author: "Venkatesh Raman",
    role: "Managing Director",
    companyOrCategory: "Precision Components & Logistics",
    rating: 5,
    tag: "Corporate Hardware AMC",
  },
  {
    id: "test-travel",
    quote:
      "TechBig Solutions arranged our entire family pilgrimage to Tirupati including confirmed ₹300 Special Entry Darshan passes, cottage accommodation, and round-trip train tickets during heavy festival rush. Zero hassle, instant confirmation, and great customer care!",
    author: "Deepa & Murali Krishna",
    role: "Family Travelers",
    companyOrCategory: "Tirupati Temple Darshan & Rail Booking",
    rating: 5,
    tag: "Travel & Temple Booking",
  },
];
