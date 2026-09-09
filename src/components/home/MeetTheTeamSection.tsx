"use client";

import React from "react";
import {
  Award,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  Sparkles,
  Building2,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Globe2,
  FileCheck
} from "lucide-react";

export function MeetTheTeamSection() {
  return (
    <section className="py-20 lg:py-28 bg-surface-deep text-white relative overflow-hidden" id="leadership">
      {/* Ambient background glows */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-action-orange/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Pill & Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/30 border border-brand-blue/50 text-blue-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-action-orange" />
            <span>Leadership & Enterprise Pedigree</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white tracking-tight">
            Meet the Founder & Principal Lead
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            TechBig Solutions is founded and spearheaded by global enterprise veterans with direct implementation leadership across Fortune 500 tech and pharma giants.
          </p>
        </div>

        {/* Founder Spotlight Card */}
        <div className="bg-white/5 border border-white/15 rounded-3xl p-6 sm:p-8 lg:p-12 backdrop-blur-xl shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Founder Avatar / Credential Badge */}
            <div className="lg:col-span-4 flex flex-col items-center text-center space-y-5">
              <div className="relative group">
                <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl bg-gradient-to-tr from-brand-blue via-slate-800 to-action-orange/40 flex items-center justify-center p-2 relative">
                  <div className="w-full h-full rounded-2xl bg-surface-deep flex flex-col items-center justify-center text-center p-4">
                    <span className="text-4xl sm:text-5xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-action-orange">
                      MA
                    </span>
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider mt-2">
                      Maheshwaran A.
                    </span>
                    <span className="text-[10px] text-amber-300 font-semibold mt-1">
                      SAP MM & S/4 HANA Certified
                    </span>
                  </div>
                </div>

                {/* Floating SAP Certified Badge */}
                <div className="absolute -bottom-3 inset-x-2 bg-gradient-to-r from-action-orange to-orange-600 text-white text-[11px] font-bold py-1.5 px-3 rounded-xl shadow-lg border border-white/20 flex items-center justify-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>SAP Certified Consultant</span>
                </div>
              </div>

              {/* Name & Designation */}
              <div className="pt-2">
                <h3 className="text-2xl font-display font-extrabold text-white">
                  Maheshwaran Adinarayanan
                </h3>
                <p className="text-xs font-semibold text-action-orange uppercase tracking-wider mt-1">
                  Founder & Principal SAP Consultant
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  B.Sc. (CS) • MBA (Banking & Finance) • Executive MBA (NIBM)
                </p>
              </div>

              {/* Verified Contact Card */}
              <div className="w-full max-w-xs space-y-2 pt-2 text-xs text-slate-300 border-t border-white/10 text-left">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-action-orange shrink-0" />
                  <a href="tel:8122196279" className="hover:text-white transition-colors">
                    (+91) 8122196279 / 8122348442
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-action-orange shrink-0" />
                  <a href="mailto:techbigsolutions@gmail.com" className="hover:text-white transition-colors truncate">
                    techbigsolutions@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-action-orange shrink-0" />
                  <span>Ambattur, Chennai, India</span>
                </div>
              </div>
            </div>

            {/* Right: Detailed Experience & Credentials */}
            <div className="lg:col-span-8 space-y-6">
              {/* Executive Summary */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block mb-1">
                  17+ Years IT Experience • 9+ Years in SAP S/4 HANA
                </span>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                  With over 17 years of domestic and international IT leadership, Maheshwaran has delivered mission-critical SAP (MM, WM) ECC 6.0 and S/4 HANA end-to-end implementations, global rollouts across 65+ countries, and high-volume enterprise enhancements for world-leading corporations.
                </p>
              </div>

              {/* Major Corporate Implementations Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Apple Retail & ER */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Lead Consultant (SAP MM HANA)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-amber-300 font-semibold">
                      Wipro / Apple
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-blue-200">
                    Apple Computers — Retail & ER Solutions
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Led SAP core enhancement requirements, Assortment DB (ADB), PAM tools, Unibox, Web Dynpro, UI5, and OData integration to SAP Core.
                  </p>
                </div>

                {/* Pfizer & Sanofi */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Lead SAP Consultant (MM / WM)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-amber-300 font-semibold">
                      Accenture
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-blue-200">
                    Pfizer & Sanofi — Global Pharma Rollouts
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    E2E rollout across 65 countries (eBuy / Coupa integration, Tibco middleware), Sanofi SCCore S/4 HANA Kinaxis integration, and Zoetis merger.
                  </p>
                </div>

                {/* International IT Management */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Overseas IT Manager
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-emerald-300 font-semibold">
                      PNG / Overseas
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-blue-200">
                    John J & H Seeto & Pacific Industries
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Directed large-scale ERP rollouts (SAP MM, QuickBooks Pro, PAYPAC, WMS, logistics) managing IT infrastructure for over 2,000+ business users.
                  </p>
                </div>

                {/* Technical Teaching & Software Roots */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Technical Pedigree
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-purple-300 font-semibold">
                      Mentorship
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-blue-200">
                    Software Engineering & ACT Faculty
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Deep technical background in ABAP debugging, .NET, C/C++, database administration, with years of teaching experience empowering young engineers.
                  </p>
                </div>
              </div>

              {/* Proven Delivery Methodologies */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 mr-2">Methodologies:</span>
                {[
                  "SAP Activate (Agile)",
                  "ASAP Methodology",
                  "Accenture Delivery (ADM)",
                  "Waterfall",
                  "Solman & Soldoc",
                  "RevTrack & ChaRM"
                ].map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 border border-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
