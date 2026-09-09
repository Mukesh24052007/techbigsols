"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Phone, ShieldCheck, ChevronRight, Rocket } from "lucide-react";

interface HeroSectionProps {
  onOpenQuoteModal: () => void;
}

export function HeroSection({ onOpenQuoteModal }: HeroSectionProps) {
  return (
    <section className="relative w-full min-h-[640px] lg:min-h-[720px] flex items-center bg-surface-deep overflow-hidden">
      {/* Background Gradients & Mesh */}
      <div className="absolute inset-0 bg-radial-gradient from-brand-blue/20 via-surface-deep to-surface-deep pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-blue/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-action-orange/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16 lg:pt-6 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Top Pill */}
            {/* <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-blue-200 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-action-orange animate-ping" />
              <span>TechBig Solutions Consulting Services Limited</span>
            </div> */}

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-white tracking-tight leading-[1.12]">
              SAP E2E Implementation, Cloud &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-amber-200 to-action-orange">
                Complete IT Solutions
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed mx-auto lg:mx-0">
              Backed by <strong className="text-white">10+ years of experience</strong> in SAP E2E implementation projects, global rollouts, support, and SAP Cloud integrations. Comprehensive solutions in <strong className="text-amber-200">System Sales & Service (Laptop & Desktop)</strong>, <strong className="text-white">Application & Android Development</strong> (C, C++, Java, Oracle, VB, .NET, SQL Server, DevOps, Azure), <strong className="text-action-orange">Website Development</strong>, and <strong className="text-white">Hardware & Networking</strong>.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href="#sap-training"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-action-orange hover:bg-orange-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-action-orange/30 transition-all hover:scale-[1.02] active:scale-95"
              >
                <span>Explore 10 SAP Modules</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                onClick={onOpenQuoteModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 px-8 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95"
              >
                <span>Request Consultation</span>
              </button>
              <a
                href="tel:8122196279"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-blue hover:bg-primary text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
              >
                <Phone className="w-4 h-4 text-amber-300" />
                <span>8122196279</span>
              </a>
            </div>

            {/* 4 Feature Highlights Strip */}
            {/* <div className="pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto lg:mx-0 text-left">
              <div>
                <p className="text-xl sm:text-2xl font-bold font-display text-white">10 Modules</p>
                <p className="text-xs text-slate-400 font-medium">SAP FICO, MM, SD & more</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-display text-action-orange">100%</p>
                <p className="text-xs text-slate-400 font-medium">Placement Support</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-display text-white">₹500/-</p>
                <p className="text-xs text-slate-400 font-medium">Min Hardware Service</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-display text-amber-300">24/7 Desk</p>
                <p className="text-xs text-slate-400 font-medium">Travel & Ticket Booking</p>
              </div>
            </div> */}
          </div>

          {/* Right Hero Visual Cards */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            <div className="relative w-full max-w-md bg-gradient-to-tr from-white/10 to-white/5 p-6 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[11px] font-bold text-action-orange uppercase tracking-wider">
                    Our 4 Core Verticals
                  </span>
                  <h3 className="text-lg font-display font-bold text-white">
                    One Destination For All Needs
                  </h3>
                </div>
                <div className="w-9 h-9 rounded-xl bg-action-orange/20 text-action-orange flex items-center justify-center">
                  <Rocket className="w-5 h-5" />
                </div>
              </div>

              {/* Service Quick Links */}
              <div className="space-y-2.5">
                <a
                  href="#sap-training"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-amber-200 transition-colors">
                        SAP Training & Global Certification
                      </p>
                      <p className="text-[10px] text-slate-400">10 Modules • 100% Placement Assistance</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </a>

                <a
                  href="#tech-courses"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-amber-200 transition-colors">
                        In-Demand IT & Software Skills
                      </p>
                      <p className="text-[10px] text-slate-400">MS Office, Tally, Python, C++, Oracle & VS</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </a>

                <a
                  href="#hardware-services"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-action-orange" />
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-amber-200 transition-colors">
                        Hardware Service & AMC Support
                      </p>
                      <p className="text-[10px] text-slate-400">Laptop, Desktop, OS & Printers from ₹500/-</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </a>

                <a
                  href="#travel-bookings"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-amber-200 transition-colors">
                        Ticket Bookings (Flight, Train, Tirupati)
                      </p>
                      <p className="text-[10px] text-slate-400">Tatkal Rail, Domestic/Intl Flights & Darshan</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </a>
              </div>

              {/* Bottom Trust Badge */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" /> 17+ Yrs Industry Leadership
                </span>
                <span className="text-[11px] text-slate-400">Ambattur</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
