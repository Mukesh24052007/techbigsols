"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  Home,
  Briefcase,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Phone,
  Sparkles,
  BadgeCheck,
  Landmark,
  Key,
} from "lucide-react";
import { useQuoteModal } from "@/context/QuoteModalContext";

interface PropertyType {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  accentColor: string;
  badgeLabel: string;
  highlights: { label: string; detail: string }[];
  ctaLabel: string;
  ctaService: string;
  featured?: boolean;
}

const propertyTypes: PropertyType[] = [
  {
    id: "residential",
    title: "Residential Properties",
    subtitle: "Apartments, Villas & Independent Houses",
    icon: Home,
    accentColor: "brand-blue",
    badgeLabel: "Most Popular",
    highlights: [
      {
        label: "BHK Apartments & Gated Communities",
        detail:
          "1, 2 & 3 BHK flats in RERA-approved projects with amenities across Bangalore & Chennai.",
      },
      {
        label: "Villas & Independent Houses",
        detail:
          "Plot-attached constructions, duplex homes and row houses for long-term ownership.",
      },
      {
        label: "Ready-to-Move & Under-Construction",
        detail:
          "Immediate possession options and early-bird pricing on new launches with builder tie-ups.",
      },
    ],
    ctaLabel: "Find Residential Properties",
    ctaService: "Residential Property Enquiry",
    featured: true,
  },
  {
    id: "commercial",
    title: "Commercial Spaces",
    subtitle: "Offices, Showrooms & IT Parks",
    icon: Briefcase,
    accentColor: "action-orange",
    badgeLabel: "For Businesses",
    highlights: [
      {
        label: "Office Spaces & Co-working",
        detail:
          "Furnished and bare-shell offices in prime business districts, IT corridors and tech parks.",
      },
      {
        label: "Retail Showrooms & Shops",
        detail:
          "High-footfall commercial ground-floor units and mall spaces with flexible lease terms.",
      },
      {
        label: "Warehouses & Industrial Sheds",
        detail:
          "Industrial zones, logistics hubs and manufacturing sheds with highway access.",
      },
    ],
    ctaLabel: "Explore Commercial Spaces",
    ctaService: "Commercial Property Enquiry",
  },
  {
    id: "plots",
    title: "Plots & Land",
    subtitle: "RERA / DTCP Approved Layouts",
    icon: Landmark,
    accentColor: "emerald",
    badgeLabel: "Investment Ready",
    highlights: [
      {
        label: "Approved Residential Plots",
        detail:
          "DTCP and RERA compliant plots with clear titles, encumbrance certificates and paved roads.",
      },
      {
        label: "Agricultural & Farm Land",
        detail:
          "Verified farm lands with EC, Patta, and mutation records for pucca investment.",
      },
      {
        label: "Commercial & Industrial Land",
        detail:
          "Zoned commercial parcels near highways and industrial estates for long-term development.",
      },
    ],
    ctaLabel: "Browse Approved Plots",
    ctaService: "Plot & Land Enquiry",
  },
];

const trustBadges = [
  {
    icon: BadgeCheck,
    color: "text-brand-blue",
    title: "RERA Verified Listings",
    sub: "Zero encumbrance properties",
  },
  {
    icon: ShieldCheck,
    color: "text-emerald-600",
    title: "Clear Title Guarantee",
    sub: "Full legal due diligence",
  },
  {
    icon: Key,
    color: "text-action-orange",
    title: "End-to-End Support",
    sub: "From search to registration",
  },
  {
    icon: MapPin,
    color: "text-purple-600",
    title: "Bangalore & Chennai",
    sub: "Pan-city property network",
  },
];

export function RealEstateSection() {
  const { openQuoteModal } = useQuoteModal();

  const accentBg: Record<string, string> = {
    "brand-blue": "bg-blue-50 text-brand-blue border-blue-100 hover:bg-brand-blue hover:text-white",
    "action-orange": "bg-amber-50 text-action-orange border-amber-100 hover:bg-action-orange hover:text-white",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-600 hover:text-white",
  };

  const iconBg: Record<string, string> = {
    "brand-blue": "bg-blue-50 text-brand-blue group-hover:bg-brand-blue group-hover:text-white",
    "action-orange": "bg-amber-50 text-action-orange group-hover:bg-action-orange group-hover:text-white",
    emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
  };

  const borderHover: Record<string, string> = {
    "brand-blue": "hover:border-blue-400",
    "action-orange": "hover:border-orange-400",
    emerald: "hover:border-emerald-400",
  };

  const checkColor: Record<string, string> = {
    "brand-blue": "text-brand-blue",
    "action-orange": "text-action-orange",
    emerald: "text-emerald-600",
  };

  return (
    <section
      className="py-20 lg:py-28 bg-gradient-to-b from-slate-50 via-white to-surface-container-low border-b border-slate-200"
      id="real-estate"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-action-orange" />
            <span>Buy · Sell · Rent · Invest</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-primary">
            Real Estate Services{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-action-orange">
              Made Simple
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Your trusted property partner across Bangalore and Chennai. RERA-verified listings, legal documentation support, and home loan tie-ups — all under one roof.
          </p>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
          {trustBadges.map((badge) => (
            <div
              key={badge.title}
              className="bg-white p-4 rounded-xl border border-slate-200/80 text-center shadow-sm"
            >
              <badge.icon className={`w-6 h-6 ${badge.color} mx-auto mb-2`} />
              <p className="text-xs font-bold text-slate-900">{badge.title}</p>
              <p className="text-[11px] text-slate-500">{badge.sub}</p>
            </div>
          ))}
        </div>

        {/* 3 Property Type Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {propertyTypes.map((prop) => (
            <div
              key={prop.id}
              className={`bg-white rounded-3xl border p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 group ${
                prop.featured
                  ? "border-2 border-brand-blue/40 relative overflow-hidden"
                  : `border-slate-200 ${borderHover[prop.accentColor]}`
              }`}
            >
              {prop.featured && (
                <span className="absolute top-4 right-4 bg-brand-blue text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                  Most Popular
                </span>
              )}

              <div>
                <div className="flex items-center justify-between mb-5">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${
                      iconBg[prop.accentColor]
                    }`}
                  >
                    <prop.icon className="w-7 h-7" />
                  </div>
                  {!prop.featured && (
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                        prop.accentColor === "emerald"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-amber-50 text-action-orange border-amber-100"
                      }`}
                    >
                      {prop.badgeLabel}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-display font-bold text-primary mb-1">
                  {prop.title}
                </h3>
                <p className="text-xs text-slate-500 mb-6">{prop.subtitle}</p>

                <div className="space-y-3 border-t border-slate-100 pt-5 mb-6">
                  {prop.highlights.map((h) => (
                    <div key={h.label} className="flex items-start gap-3 text-xs text-slate-700">
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 mt-0.5 ${checkColor[prop.accentColor]}`}
                      />
                      <div>
                        <strong className="text-slate-900 block font-semibold">
                          {h.label}
                        </strong>
                        <span className="text-slate-500">{h.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => openQuoteModal(prop.ctaService)}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border ${
                    accentBg[prop.accentColor]
                  }`}
                >
                  <span>{prop.ctaLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Legal Support & Loan Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
          <div className="bg-surface-container-low rounded-2xl border border-slate-200 p-6 flex gap-5 items-start">
            <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-brand-blue" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                Legal Documentation Support
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sale agreement drafting, title deed verification, encumbrance certificate checks, and complete stamp duty & registration guidance handled end-to-end.
              </p>
            </div>
          </div>
          <div className="bg-surface-container-low rounded-2xl border border-slate-200 p-6 flex gap-5 items-start">
            <div className="w-12 h-12 rounded-xl bg-action-orange/10 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-action-orange" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                Home Loan & Bank Tie-Ups
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pre-approved home loan assistance with leading nationalized banks and NBFCs. Minimum documentation, quick sanction, and EMI calculation support.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="bg-surface-deep text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-blue/30 via-transparent to-transparent pointer-events-none" />
          <div className="space-y-1 text-center md:text-left relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
              LOCATIONS: BANGALORE & CHENNAI
            </p>
            <h4 className="text-xl sm:text-2xl font-display font-extrabold">
              Your Dream Property Is Just a Call Away
            </h4>
            <p className="text-xs sm:text-sm text-slate-300">
              Free Consultation · RERA Verified · End-to-End Transaction Support
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 relative z-10">
            <Link
              href="/services#real-estate"
              className="bg-white text-brand-blue hover:bg-blue-50 px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <span>Full Real Estate Details</span>
              <ArrowRight className="w-3.5 h-3.5 text-action-orange" />
            </Link>
            <a
              href="tel:8122196279"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all"
            >
              <Phone className="w-4 h-4 text-amber-300" />
              <span>8122196279</span>
            </a>
            <button
              onClick={() => openQuoteModal("Real Estate Consultation")}
              className="bg-action-orange hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <span>Free Consultation</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
