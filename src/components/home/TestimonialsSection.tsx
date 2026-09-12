"use client";

import React from "react";
import { Star, Quote, CheckCircle2 } from "lucide-react";

interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  companyOrCategory: string;
  rating: number;
  tag: string;
}

const clientTestimonials: TestimonialItem[] = [
  {
    id: "test-sap",
    quote: "The SAP MM and S/4 HANA training mentored by Maheshwaran sir was truly eye-opening. He teaches with real-world scenarios from Apple and Accenture projects. Thanks to their interview preparation and 100% placement support, I received an offer letter as an SAP Associate Consultant within 45 days of course completion!",
    author: "Karthik Sundaram",
    role: "SAP MM Consultant",
    companyOrCategory: "Placed at Global IT Services MNC",
    rating: 5,
    tag: "SAP Training Graduate"
  },
  {
    id: "test-hardware",
    quote: "We signed an Annual Maintenance Contract (AMC) with TechBig Solutions for our 35 office workstations and network printers in Ambattur. Their technicians respond in under 30 minutes for doorstep support, and preventive checkups keep our downtime close to zero. Truly reliable and affordable!",
    author: "Venkatesh Raman",
    role: "Managing Director",
    companyOrCategory: "Precision Components & Logistics",
    rating: 5,
    tag: "Corporate Hardware AMC"
  },
  {
    id: "test-travel",
    quote: "TechBig Solutions arranged our entire family pilgrimage to Tirupati including confirmed ₹300 Special Entry Darshan passes, cottage accommodation, and round-trip train tickets during heavy festival rush. Zero hassle, instant confirmation, and great customer care!",
    author: "Deepa & Murali Krishna",
    role: "Family Travelers",
    companyOrCategory: "Tirupati Temple Darshan & Rail Booking",
    rating: 5,
    tag: "Travel & Temple Booking"
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          {/* <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-xs font-bold uppercase tracking-wider">
            Verified Feedback
          </div> */}
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-primary">
            Trusted by Learners, Enterprises & Families
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Real stories from our students, corporate hardware clients, and travel booking customers.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {clientTestimonials.map((t) => (
            <div
              key={t.id}
              className="bg-surface-container-low p-7 sm:p-8 rounded-3xl border border-slate-200/90 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 group hover:border-brand-blue/40"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white text-brand-blue border border-slate-200">
                    {t.tag}
                  </span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed italic mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-blue text-white font-bold flex items-center justify-center text-sm shrink-0">
                  {t.author.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{t.author}</p>
                  <p className="text-xs text-action-orange font-semibold">{t.role}</p>
                  <p className="text-[11px] text-slate-500">{t.companyOrCategory}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
