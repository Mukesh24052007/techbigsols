"use client";

import React from "react";
import Link from "next/link";
import {
  Code,
  Terminal,
  FileSpreadsheet,
  Calculator,
  Database,
  Network,
  Cpu,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Award
} from "lucide-react";
import { useQuoteModal } from "@/context/QuoteModalContext";

interface Course {
  id: string;
  name: string;
  price: string;
  tagline: string;
  topics: string[];
  icon: React.ElementType;
  popular?: boolean;
}

const skillCourses: Course[] = [
  {
    id: "ms-office",
    name: "MS OFFICE",
    price: "₹ 5,000",
    tagline: "Word • Excel • PowerPoint",
    topics: ["Advanced Formulas", "Pivot Tables", "Productivity"],
    icon: FileSpreadsheet
  },
  {
    id: "tally",
    name: "TALLY PRIME",
    price: "₹ 7,000",
    tagline: "Accounting & GST",
    topics: ["GST Filing & E-Way Bills", "Inventory", "Payroll"],
    icon: Calculator,
    popular: true
  },
  {
    id: "visual-studio",
    name: "VISUAL STUDIO",
    price: "₹ 15,000",
    tagline: ".NET & Enterprise C#",
    topics: ["Code, Debug & Deploy", "Windows/Web Apps", "DB Integration"],
    icon: Code
  },
  {
    id: "c-cpp",
    name: "C / C++ CODING",
    price: "₹ 8,000",
    tagline: "Core Programming",
    topics: ["High-Performance Logic", "Data Structures", "Algorithms"],
    icon: Terminal
  },
  {
    id: "oracle",
    name: "ORACLE DATABASE",
    price: "₹ 12,000",
    tagline: "SQL & Administration",
    topics: ["PL/SQL Triggers", "DB Architecture", "Performance"],
    icon: Database
  },
  {
    id: "python",
    name: "PYTHON DEV",
    price: "₹ 10,000",
    tagline: "Automation & Projects",
    topics: ["Core OOP", "Web Scraping", "Real-World APIs"],
    icon: Cpu,
    popular: true
  },
  {
    id: "hardware-networking",
    name: "HARDWARE & NETWORK",
    price: "₹ 8,000",
    tagline: "Lab & Diagnostics",
    topics: ["PC Assembly", "LAN/WAN Configuration", "Troubleshooting"],
    icon: Network
  }
];

export function TechCoursesSection() {
  const { openQuoteModal } = useQuoteModal();

  return (
    <section className="py-20 bg-surface-container-low border-y border-slate-200" id="tech-courses">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-action-orange" />
            <span>Practical Learning • Industry Focused</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-primary">
            Master In-Demand Skills.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-action-orange">
              Boost Your Career & Business
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Certified technical training with real-time projects, live coding practice, transparent fees, and 100% placement support.
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {skillCourses.map((course) => {
            const IconComp = course.icon;
            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:border-brand-blue/40 relative"
              >
                {course.popular && (
                  <span className="absolute top-3 right-3 bg-action-orange text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                )}
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-brand-blue mb-3 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-display font-bold text-primary">
                    {course.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mb-3">
                    {course.tagline}
                  </p>
                  <div className="space-y-1.5 border-t border-slate-100 pt-3 mb-4">
                    {course.topics.map((t, idx) => (
                      <p key={idx} className="text-xs text-slate-600 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{t}</span>
                      </p>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-extrabold text-primary font-display">
                    {course.price}
                  </span>
                  <button
                    onClick={() => openQuoteModal(`Skill Course: ${course.name}`)}
                    className="text-xs font-bold text-brand-blue hover:text-action-orange transition-colors"
                  >
                    Enroll Now →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Link to Complete Services Page */}
        <div className="text-center">
          <Link
            href="/services#software-development"
            className="inline-flex items-center gap-2 bg-brand-blue hover:bg-primary text-white text-xs sm:text-sm font-bold px-8 py-3.5 rounded-xl shadow-md transition-all active:scale-95"
          >
            <span>Explore All Software Courses & Full Curriculum Details</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
