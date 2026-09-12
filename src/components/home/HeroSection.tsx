"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  Phone,
  ShieldCheck,
  ChevronRight,
  Rocket,
  MapPin,
  ChevronDown,
  Globe,
  Laptop,
  Smartphone,
  Cpu,
  Layers,
  Calendar,
} from "lucide-react";
import {
  heroTechStackBadges,
  heroCapabilities,
  heroServiceLinks,
  heroBranchInfo,
  type HeroCapabilityItem,
} from "@/data/hero";

interface HeroSectionProps {
  onOpenQuoteModal: () => void;
}

function PngFlagIcon({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 30"
      className={`${className} rounded-[3px] shadow-sm shrink-0 border border-white/20`}
      aria-hidden="true"
    >
      <rect width="40" height="30" fill="#0c0d0e" />
      <polygon points="0,0 40,0 0,30" fill="#ce1126" />
      {/* Southern cross stars */}
      <circle cx="28" cy="23" r="1.1" fill="#ffffff" />
      <circle cx="28" cy="17" r="1.1" fill="#ffffff" />
      <circle cx="24.5" cy="20.5" r="1.1" fill="#ffffff" />
      <circle cx="31.5" cy="19.5" r="1.1" fill="#ffffff" />
      <circle cx="29" cy="21" r="0.7" fill="#ffffff" />
      {/* Stylized Bird of paradise */}
      <path d="M 10 9 C 14 8 18 12 19 14 C 15 13 11 12 9 10 Z" fill="#fcd116" />
      <circle cx="10" cy="9" r="1.5" fill="#fcd116" />
    </svg>
  );
}

const capabilityIconMap: Record<string, React.ElementType> = {
  Laptop,
  Globe,
  Cpu,
  Smartphone,
};

function CapabilityIcon({ iconName, className }: { iconName: string; className?: string }) {
  const Icon = capabilityIconMap[iconName];
  return Icon ? <Icon className={className} /> : null;
}

const capabilityIconColorMap: Record<string, string> = {
  Laptop: "text-action-orange",
  Globe: "text-blue-400",
  Cpu: "text-amber-400",
  Smartphone: "text-emerald-400",
};

export function HeroSection({ onOpenQuoteModal }: HeroSectionProps) {
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [branchOpen, setBranchOpen] = useState(false);

  return (
    <section className="relative w-full min-h-[600px] lg:min-h-[720px] flex items-center bg-surface-deep overflow-hidden">
      {/* Background Gradients & Mesh */}
      <div className="absolute inset-0 bg-radial-gradient from-brand-blue/20 via-surface-deep to-surface-deep pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-80 sm:w-96 h-80 sm:h-96 bg-brand-blue/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 sm:w-96 h-80 sm:h-96 bg-action-orange/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem] pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-12 sm:pt-8 sm:pb-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">

          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Main Headline */}
            <h1 className="text-[1.85rem] leading-[1.18] sm:text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-white tracking-tight">
              SAP E2E Implementation, Cloud &amp;{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-amber-200 to-action-orange">
                Complete IT Solutions
              </span>
            </h1>

            {/* Subheading & Creative Expandable Scope */}
            <div className="max-w-2xl mx-auto lg:mx-0 space-y-3.5">
              {/* Primary Tagline */}
              <p className="text-sm sm:text-base lg:text-lg text-slate-300 font-normal leading-relaxed">
                Backed by <strong className="text-white font-semibold">10+ years of experience</strong> in SAP E2E implementation projects, global rollouts, support, and SAP Cloud integrations.
              </p>

              {/* Collapsible Full Capabilities Showcase */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setSummaryExpanded((v) => !v)}
                  aria-expanded={summaryExpanded}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 hover:text-white transition-all group"
                >
                  <span>{summaryExpanded ? "Hide Detailed Capabilities" : "Explore Full Capability Spectrum (Web, App, AMC)"}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-action-orange transition-transform duration-300 ${summaryExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${summaryExpanded ? "max-h-[500px] opacity-100 mt-3" : "max-h-0 opacity-0"}`}
                >
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/15 backdrop-blur-md space-y-3 text-left">
                    <p className="text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" /> Comprehensive Enterprise Solutions
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {heroCapabilities.map((cap: HeroCapabilityItem) => (
                        <div key={cap.iconName} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                          <CapabilityIcon
                            iconName={cap.iconName}
                            className={`w-4 h-4 shrink-0 mt-0.5 ${capabilityIconColorMap[cap.iconName] ?? "text-white"}`}
                          />
                          <div>
                            <p className="text-xs font-bold text-white">{cap.title}</p>
                            <p className="text-[11px] text-slate-300">{cap.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Technologies Tag Cloud */}
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                        Core Tech Stack &amp; Environments
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {heroTechStackBadges.map((tech) => (
                          <span
                            key={tech}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-slate-200"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs: Mobile-Optimized Grid vs Desktop Row */}
            <div className="pt-1">
              {/* Desktop layout: horizontal row */}
              <div className="hidden sm:flex items-center justify-center lg:justify-start gap-3.5">
                <a
                  href="#sap-training"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-action-orange to-orange-500 hover:from-orange-500 hover:to-action-orange text-white px-7 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-action-orange/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  <span>Explore 10 SAP Modules</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={onOpenQuoteModal}
                  className="inline-flex items-center justify-center gap-2 border border-white/25 bg-white/5 hover:bg-white/15 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 cursor-pointer backdrop-blur-sm"
                >
                  <Calendar className="w-4 h-4 text-amber-300" />
                  <span>Request Consultation</span>
                </button>
                <a
                  href="tel:8122196279"
                  className="inline-flex items-center justify-center gap-2 bg-brand-blue hover:bg-primary border border-blue-400/30 text-white px-5 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-amber-300" />
                  <span>8122196279</span>
                </a>
              </div>

              {/* Mobile layout: Primary button on top + side-by-side secondary pair */}
              <div className="flex sm:hidden flex-col gap-2.5 w-full">
                {/* Primary CTA */}
                <a
                  href="#sap-training"
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-action-orange to-orange-500 active:bg-orange-600 text-white py-3.5 px-4 rounded-xl font-bold text-sm shadow-md shadow-action-orange/30 active:scale-[0.98] transition-transform"
                >
                  <span>Explore 10 SAP Modules</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                {/* 2-Column Compact Row */}
                <div className="grid grid-cols-2 gap-2.5 w-full">
                  <button
                    type="button"
                    onClick={onOpenQuoteModal}
                    className="inline-flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 active:bg-white/20 border border-white/20 text-white py-3 px-2 rounded-xl font-semibold text-xs transition-all active:scale-[0.98] backdrop-blur-md"
                  >
                    <Calendar className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span className="truncate">Consultation</span>
                  </button>

                  <a
                    href="tel:8122196279"
                    className="inline-flex items-center justify-center gap-1.5 bg-brand-blue/90 hover:bg-brand-blue active:bg-primary border border-blue-400/40 text-white py-3 px-2 rounded-xl font-semibold text-xs shadow-sm transition-all active:scale-[0.98]"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span className="truncate">8122196279</span>
                  </a>
                </div>
              </div>
            </div>

            {/* PNG International Branch Card */}
            <div className="pt-2">
              <div className="inline-block w-full sm:w-auto text-left">
                <div className="bg-white/5 border border-white/15 hover:border-white/25 rounded-2xl p-3 sm:px-4 sm:py-3 backdrop-blur-md transition-all group">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <PngFlagIcon className="w-6 h-4 sm:w-7 sm:h-5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-action-orange border border-action-orange/40 rounded-full px-2 py-0.5 bg-action-orange/10">
                            Intl Branch
                          </span>
                          <span className="text-xs font-bold text-white">{heroBranchInfo.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-medium">{heroBranchInfo.contactName}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setBranchOpen((v) => !v)}
                      className="sm:hidden text-xs text-action-orange hover:text-amber-300 font-semibold inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 transition-colors"
                      aria-label="Toggle international branch address details"
                    >
                      <span className="hidden xs:inline">{branchOpen ? "Hide" : "Address"}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-300 ${branchOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>

                  {/* Expandable address details on mobile, always visible on desktop */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${branchOpen ? "max-h-32 opacity-100 mt-2.5 pt-2.5 border-t border-white/10" : "max-h-0 sm:max-h-32 opacity-0 sm:opacity-100 sm:mt-2 sm:pt-2 sm:border-t sm:border-white/10"}`}
                  >
                    <div className="flex items-start gap-2 text-[11px] leading-snug text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-action-orange mt-0.5 shrink-0" />
                      <div>
                        <span className="block text-slate-200">{heroBranchInfo.address}</span>
                        <span className="block text-slate-300">{heroBranchInfo.addressLine2}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Cards: 4 Core Verticals */}
          <div className="lg:col-span-5 flex justify-center items-center relative w-full mt-4 lg:mt-0">
            <div className="relative w-full max-w-md bg-gradient-to-tr from-white/10 to-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/20 shadow-2xl backdrop-blur-xl space-y-3.5 sm:space-y-4">

              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4">
                <div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-action-orange uppercase tracking-wider">
                    Our 4 Core Verticals
                  </span>
                  <h3 className="text-base sm:text-lg font-display font-bold text-white">
                    One Destination For All Needs
                  </h3>
                </div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-action-orange/20 text-action-orange flex items-center justify-center shrink-0">
                  <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>

              {/* Service Quick Links */}
              <div className="space-y-2 sm:space-y-2.5">
                {heroServiceLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <span className={`w-2 h-2 rounded-full ${link.dotColor} shrink-0`} />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-xs font-bold text-white group-hover:text-amber-200 transition-colors truncate">
                          {link.title}
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">{link.subtitle}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 ml-1" />
                  </a>
                ))}
              </div>

              {/* Bottom Trust Badge */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px] sm:text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> 17+ Yrs Leadership
                </span>
                <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-400">
                  <span>🇮🇳</span> Ambattur &nbsp;·&nbsp; <span>🇵🇬</span> PNG
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
