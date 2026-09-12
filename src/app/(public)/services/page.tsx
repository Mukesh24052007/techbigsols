"use client";

import React from "react";
import Link from "next/link";
import { servicesData, faqsData } from "@/data/services";
import { SYLLABUS_PATHS } from "@/data/syllabuses";
import { useQuoteModal } from "@/context/QuoteModalContext";
import {
  Server,
  GraduationCap,
  Wrench,
  Plane,
  Building2,
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
  PhoneCall,
  Sparkles,
  Phone,
  MessageSquare,
  Award,
  Clock,
  MapPin,
  ChevronDown,
  Ship,
  Users,
  FileText
} from "lucide-react";

export default function ServicesPage() {
  const { openQuoteModal } = useQuoteModal();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Server":
        return <Server className="w-5 h-5 text-brand-blue" />;
      case "GraduationCap":
        return <GraduationCap className="w-5 h-5 text-brand-blue" />;
      case "Wrench":
        return <Wrench className="w-5 h-5 text-action-orange" />;
      case "Plane":
        return <Plane className="w-5 h-5 text-emerald-600" />;
      case "Ship":
        return <Ship className="w-5 h-5 text-brand-blue" />;
      case "Building2":
        return <Building2 className="w-5 h-5 text-brand-blue" />;
      case "Users":
        return <Users className="w-5 h-5 text-brand-blue" />;
      default:
        return <Sparkles className="w-5 h-5 text-brand-blue" />;
    }
  };

  return (
    <main className="flex-1 w-full bg-surface">
      {/* 1. Services Hero */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-surface-deep text-white border-b border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-action-orange/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-blue/30 border border-brand-blue/50 text-blue-200 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            {/* <Sparkles className="w-4 h-4 text-action-orange" /> */}
            <span>Comprehensive Enterprise & Career Services</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-white tracking-tight">
            Complete Services Guide
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Detailed information on our SAP E2E implementations, 10-module career academy, custom software development, doorstep hardware repair, travel ticketing desk, and real estate property services.
          </p>

          {/* Quick Jump Anchor Pills */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2.5">
            <a
              href="#sap-enterprise"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all"
            >
              1. SAP E2E & Training
            </a>
            <a
              href="#software-development"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all"
            >
              2. Software & Skill Courses
            </a>
            <a
              href="#hardware-amc"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all"
            >
              3. Hardware Service & AMC
            </a>
            <a
              href="#travel-bookings"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all"
            >
              4. Ticket & Temple Bookings
            </a>
            <a
              href="#real-estate"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all"
            >
              5. Real Estate Services
            </a>
          </div>
        </div>
      </section>

      {/* 2. Services Detailed Sections */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-24 lg:space-y-32">
        {servicesData.map((service, index) => {
          const isEven = index % 2 === 1;

          return (
            <div
              key={service.id}
              id={service.id}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start scroll-mt-28 border-b border-slate-200/80 pb-20 last:border-0 last:pb-0"
            >
              {/* Image & Highlights Column */}
              <div
                className={`lg:col-span-5 space-y-6 ${isEven ? "lg:order-2" : "lg:order-1"
                  }`}
              >
                <div className="relative rounded-3xl p-3 bg-white border border-slate-200/90 shadow-xl group hover:shadow-2xl transition-all duration-500">
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-surface-container-low">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-deep/60 via-transparent to-transparent pointer-events-none" />
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Official Service Line
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-brand-blue">
                      Ambattur
                    </span>
                  </div>
                </div>

                {/* Direct Contact Card */}
                <div className="bg-surface-container-low border border-slate-200/80 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Need Immediate Consultation?
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <a
                      href="tel:8122196279"
                      className="flex-1 bg-brand-blue hover:bg-primary text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5 text-amber-300" />
                      <span>Call 8122196279</span>
                    </a>
                    <a
                      href={`https://wa.me/918122196279?text=Hello%20TechBig%20Solutions,%20I%20am%20interested%20in%20${encodeURIComponent(service.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Us</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Text / Content Column */}
              <div
                className={`lg:col-span-7 ${isEven ? "lg:order-1 lg:pr-8" : "lg:order-2 lg:pl-8"
                  } space-y-6`}
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20">
                  {getIcon(service.iconName)}
                  <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">
                    {service.category}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-primary leading-tight">
                  {service.title}
                </h2>

                <p className="text-xs font-semibold text-action-orange uppercase tracking-wider">
                  {service.tagline}
                </p>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                  {service.description}
                </p>

                {/* Key Points Bullet List */}
                <div className="space-y-3 pt-2">
                  {service.keyPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-action-orange flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm font-medium text-slate-800">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Detailed Feature Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  {service.features.map((feat, i) => (
                    <div
                      key={i}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
                    >
                      <h4 className="text-xs font-bold text-slate-900 mb-1">
                        {feat.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        {feat.desc}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Syllabus Downloads — shown only for SAP and Software service sections */}
                {service.id === "sap-enterprise" && (
                  <div className="pt-2 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand-blue" />
                      Download SAP Module Syllabuses
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: "sap-fico",     label: "SAP FICO" },
                        { id: "sap-sd",       label: "SAP SD" },
                        { id: "sap-mm",       label: "SAP MM" },
                        { id: "sap-wm",       label: "SAP WM" },
                        { id: "sap-ewm",      label: "SAP EWM" },
                        { id: "sap-pp",       label: "SAP PP" },
                        { id: "sap-qm",       label: "SAP QM" },
                        { id: "sap-attp",     label: "SAP ATTP" },
                        { id: "sap-apo",      label: "SAP APO" },
                        { id: "sap-basis",    label: "SAP BASIS" },
                        { id: "sap-abap",     label: "SAP ABAP" },
                        { id: "sap-hr",       label: "SAP HCM" },
                        { id: "sap-payroll",  label: "SAP Payroll" },
                        { id: "sap-security", label: "SAP Security" },
                      ].map(({ id, label }) => {
                        const path = SYLLABUS_PATHS[id];
                        return path ? (
                          <a
                            key={id}
                            href={path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 border border-brand-blue/25 hover:border-brand-blue bg-white hover:bg-brand-blue/5 text-brand-blue text-[11px] font-bold px-3 py-2 rounded-lg transition-all"
                          >
                            <FileText className="w-3 h-3 shrink-0" />
                            <span className="truncate">{label}</span>
                          </a>
                        ) : (
                          <span
                            key={id}
                            title="Syllabus PDF coming soon"
                            className="flex items-center gap-1.5 border border-slate-200 text-slate-400 text-[11px] px-3 py-2 rounded-lg cursor-default"
                          >
                            <FileText className="w-3 h-3 shrink-0" />
                            <span className="truncate">{label} — Soon</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {service.id === "software-development" && (
                  <div className="pt-2 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand-blue" />
                      Download Course Syllabuses
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: "python",         label: "Python" },
                        { id: "oracle",         label: "Oracle DB" },
                        { id: "advanced-excel", label: "Advanced Excel" },
                        { id: "power-bi",       label: "Power BI" },
                        { id: "tableau",        label: "Tableau" },
                        { id: "sql-server",     label: "SQL Server" },
                      ].map(({ id, label }) => {
                        const path = SYLLABUS_PATHS[id];
                        return path ? (
                          <a
                            key={id}
                            href={path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 border border-brand-blue/25 hover:border-brand-blue bg-white hover:bg-brand-blue/5 text-brand-blue text-[11px] font-bold px-3 py-2 rounded-lg transition-all"
                          >
                            <FileText className="w-3 h-3 shrink-0" />
                            <span className="truncate">{label}</span>
                          </a>
                        ) : null;
                      })}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Syllabuses for MS Office, Tally Prime, Visual Studio, C/C++ and Hardware & Networking are available on request — call or WhatsApp us.
                    </p>
                  </div>
                )}

                {/* Action Triggers */}
                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => openQuoteModal(service.title)}
                    className="inline-flex items-center gap-2 bg-action-orange hover:bg-orange-600 text-white px-7 py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
                  >
                    <span>{service.ctaLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <Link
                    href="/#leadership"
                    className="inline-flex items-center gap-2 border border-slate-300 hover:border-brand-blue text-slate-700 hover:text-brand-blue px-6 py-3 rounded-xl font-semibold text-sm transition-all"
                  >
                    <Award className="w-4 h-4 text-brand-blue" />
                    <span>View Founder Pedigree</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. Frequently Asked Questions */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-container-low border-t border-slate-200">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
              Questions & Answers
            </span>
            <h2 className="text-3xl font-display font-extrabold text-primary">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Clear answers regarding our SAP modules, training fee structure, hardware turnaround, and ticket reservations.
            </p>
          </div>

          <div className="space-y-4">
            {faqsData.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-2"
              >
                <div className="flex items-center gap-2 text-action-orange text-xs font-bold uppercase tracking-wider">
                  <span>{faq.category}</span>
                </div>
                <h3 className="text-base font-display font-bold text-slate-900">
                  {faq.question}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Bottom Consultation CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-deep text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-display font-bold">
            Ready to Enroll, Schedule Service, or Book Travel?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Reach out to our specialists in Ambattur. We provide custom batch scheduling, corporate AMC quotes, and instant travel passes.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openQuoteModal("General Consultation")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-action-orange hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-sm shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <span>Request Free Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="tel:8122196279"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-7 py-4 rounded-xl font-bold text-sm border border-white/20 transition-all"
            >
              <Phone className="w-4 h-4 text-amber-300" />
              <span>Call: 8122196279</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
