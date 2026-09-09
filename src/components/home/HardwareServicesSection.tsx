"use client";

import React from "react";
import Link from "next/link";
import {
  Laptop,
  Monitor,
  Printer,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ArrowRight,
  Sparkles,
  Zap,
  HardDrive
} from "lucide-react";
import { useQuoteModal } from "@/context/QuoteModalContext";

interface HardwareService {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  items: string[];
  popular?: boolean;
}

const hardwareServices: HardwareService[] = [
  {
    id: "laptop-service",
    title: "LAPTOP SERVICE",
    icon: Laptop,
    description: "End-to-end chip-level & component diagnostics for all major brands (Dell, HP, Lenovo, Apple, Asus, Acer).",
    items: [
      "Screen & Display Replacement",
      "Keyboard & Trackpad Repair",
      "Battery Issues & Charger Port Fixes",
      "Overheating, Thermal Paste & Fan Cleaning",
      "Slow Performance & SSD / RAM Upgrades"
    ],
    popular: true
  },
  {
    id: "os-software",
    title: "OS & SOFTWARE INSTALLATION",
    icon: HardDrive,
    description: "Clean, licensed operating system installations, essential utility drivers, and enterprise system optimization.",
    items: [
      "Genuine Windows OS Installation & Activation",
      "Official Driver Setup & Motherboard Bios Updates",
      "Business & Productivity Software Installation",
      "Secure Data Backup & Full System Migration",
      "Performance Optimization & Bloatware Removal"
    ]
  },
  {
    id: "amc",
    title: "ANNUAL MAINTENANCE CONTRACT (AMC)",
    icon: ShieldCheck,
    description: "Proactive, worry-free maintenance packages for offices, commercial workspaces, schools, and homes.",
    items: [
      "Scheduled Monthly Preventive Maintenance",
      "Regular System Health Checkups & Diagnostics",
      "Priority Same-Day Doorstep Support Dispatch",
      "Significant Long-Term Cost Savings on Spares",
      "Dedicated Enterprise SLA & Remote Assistance"
    ],
    popular: true
  },
  {
    id: "desktop-service",
    title: "DESKTOP SERVICE",
    icon: Monitor,
    description: "Complete workstation repair, custom PC builds, SMPS power unit fixes, and motherboard repairs.",
    items: [
      "Component-Level Hardware Troubleshooting",
      "Motherboard & SMPS Power Supply Replacement",
      "Malware, Ransomware & Virus Removal",
      "Gaming / Rendering Rig Upgrades & Assembly",
      "Comprehensive Speed & Performance Tuning"
    ]
  },
  {
    id: "printer-xerox",
    title: "PRINTER & XEROX SERVICE",
    icon: Printer,
    description: "Reliable commercial and home printer repair, toner cartridge refilling, and network scanner integration.",
    items: [
      "Printer Installation & Wireless Network Driver Setup",
      "Paper Jam Removal & Roller Mechanism Repair",
      "LaserJet & Ink Tank Toner Cartridge Refilling",
      "Head Cleaning & Print Quality Troubleshooting",
      "Heavy-Duty Xerox & Multifunction Copier Servicing"
    ]
  }
];

export function HardwareServicesSection() {
  const { openQuoteModal } = useQuoteModal();

  return (
    <section className="py-20 lg:py-28 bg-white border-b border-slate-200" id="hardware-services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Pricing Callout */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-14">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Reliable • Fast • Affordable</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-primary tracking-tight">
              Hardware Service.{" "}
              <span className="text-brand-blue">We Care Your Devices.</span>
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Complete IT hardware & workstation solutions for your business and home. From urgent laptop repairs to enterprise Annual Maintenance Contracts (AMC).
            </p>
          </div>

          {/* Pricing Highlight Pill from Poster */}
          <div className="bg-gradient-to-br from-amber-500 via-action-orange to-orange-600 text-white p-5 rounded-2xl shadow-lg shrink-0 flex items-center gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-100">
                Minimum Service Cost
              </p>
              <p className="text-3xl font-display font-extrabold text-white">
                ₹ 500/-
              </p>
              <p className="text-[10px] text-white/90 font-medium">Onwards • Fast Doorstep Service</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Wrench className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* 5 Hardware Services Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {hardwareServices.map((service) => {
            const IconComp = service.icon;
            return (
              <div
                key={service.id}
                className="bg-surface-container-low rounded-2xl border border-slate-200/90 p-6 sm:p-7 flex flex-col justify-between hover:shadow-xl transition-all duration-300 group hover:border-brand-blue/50 relative overflow-hidden"
              >
                {service.popular && (
                  <span className="absolute top-4 right-4 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                    High Demand
                  </span>
                )}

                <div>
                  <div className="w-12 h-12 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-brand-blue group-hover:text-white transition-all duration-300">
                    <IconComp className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-display font-bold text-primary group-hover:text-brand-blue transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="space-y-2 border-t border-slate-200/80 pt-4 mb-6">
                    {service.items.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">Doorstep & On-Site</span>
                  <button
                    onClick={() => openQuoteModal(`Hardware Service: ${service.title}`)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-action-orange group-hover:underline"
                  >
                    <span>Book Repair</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Quick Booking Callout Card */}
          <div className="bg-gradient-to-br from-primary to-slate-900 text-white rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-md">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
                <Zap className="w-3.5 h-3.5" /> Doorstep Quick Dispatch
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-2">
                Need Immediate Hardware Repair?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                We come to you anywhere in Chennai (Ambattur & surrounding areas). Fast turnaround and genuine components guaranteed.
              </p>
              <div className="space-y-2 text-xs text-slate-300 border-t border-white/10 pt-3">
                <p className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-action-orange" />
                  <span>30-minute rapid technician response</span>
                </p>
                <p className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-action-orange" />
                  <span>Warranty on all genuine replacement spares</span>
                </p>
              </div>
            </div>

            <div className="pt-6">
              <a
                href="tel:8122196279"
                className="w-full bg-action-orange hover:bg-orange-600 text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <Phone className="w-4 h-4" />
                <span>Call Technician: 8122196279</span>
              </a>
            </div>
          </div>
        </div>

        {/* Why Choose Us for Hardware (From Poster 4) */}
        <div className="bg-surface-container-low rounded-2xl border border-slate-200 p-6 sm:p-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h4 className="text-base sm:text-lg font-display font-bold text-primary">
              Why Customers Rely on TechBig Hardware Support
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Quality Service • Trusted Support • Quick Turnaround • 100% Satisfaction
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                title: "Experienced Technicians",
                desc: "Skilled & certified hardware professionals"
              },
              {
                title: "Quick Response",
                desc: "Fast doorstep service at your convenience"
              },
              {
                title: "Genuine Parts",
                desc: "Original spares for long-lasting performance"
              },
              {
                title: "Affordable Prices",
                desc: "Transparent rates starting from ₹500 onwards"
              },
              {
                title: "On-Site Support",
                desc: "We come to you anywhere, anytime"
              }
            ].map((p, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200/80 text-center shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-action-orange mx-auto mb-2" />
                <h5 className="text-xs font-bold text-slate-900 mb-1">{p.title}</h5>
                <p className="text-[11px] text-slate-500 leading-tight">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/services#hardware-amc"
              className="inline-flex items-center gap-2 bg-brand-blue hover:bg-primary text-white text-xs sm:text-sm font-bold px-8 py-3.5 rounded-xl shadow-md transition-all active:scale-95"
            >
              <span>View Complete Hardware Service Guide & AMC Packages</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
