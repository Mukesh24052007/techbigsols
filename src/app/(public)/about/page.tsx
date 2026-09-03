"use client";

import React from "react";
import Link from "next/link";
import { useQuoteModal } from "@/context/QuoteModalContext";
import {
  Rocket,
  Award,
  Lightbulb,
  Handshake,
  Eye,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Target,
  Sparkles,
  Users,
  Building
} from "lucide-react";

export default function AboutPage() {
  const { openQuoteModal } = useQuoteModal();

  return (
    <main className="flex-1 w-full bg-surface">
      {/* 1. HERO SECTION */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 px-4 sm:px-6 lg:px-8 bg-surface overflow-hidden">
        <div className="absolute inset-0 hero-pattern pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-fixed/40 border border-primary-fixed text-primary text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-brand-blue" />
              <span>Our Story & Mission</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-primary leading-tight">
              Pioneering <span className="text-brand-blue">Innovation</span> in Enterprise Tech.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              At TechBigSolutions, we believe that robust, scalable technology is the foundation of modern business success. We engineer solutions that empower enterprises to navigate complexity with confidence, precision, and clarity.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={() => openQuoteModal()}
                className="inline-flex items-center gap-2 bg-action-orange hover:bg-secondary-container text-white px-7 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
              >
                <span>Partner With Us</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 border border-slate-300 hover:border-brand-blue text-slate-700 hover:text-brand-blue px-7 py-3.5 rounded-xl font-semibold text-sm transition-all"
              >
                <span>View Our Track Record</span>
              </Link>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="relative aspect-video lg:aspect-[4/3] rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-white p-3 group">
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              <img
                src="https://nhxkqgwbiiaervkaeres.supabase.co/storage/v1/object/public/techbig/SystemSales&IT-services.jpg"
                alt="TechBigSolutions Engineering Team"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-deep/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-xs uppercase font-bold text-action-orange tracking-wider">Enterprise Excellence</p>
                <p className="text-sm sm:text-base font-bold font-display mt-0.5">Engineered for durability, scale, and high-trust partnerships.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MISSION & VISION BENTO GRID */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-200/80" id="values">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-xs font-bold uppercase tracking-wider">
              Guiding Principles
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-primary">
              Driving the Future Forward
            </h2>
            <p className="text-base text-slate-600">
              Our strategic direction is guided by an unyielding commitment to foundational excellence, transparent collaboration, and forward-thinking problem solving.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[270px]">
            {/* Mission Card (Span 2) */}
            <div className="col-span-1 lg:col-span-2 row-span-1 bg-surface-container-low rounded-3xl p-8 border border-slate-200/80 flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none group-hover:bg-brand-blue/20 transition-colors" />
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-blue text-white flex items-center justify-center shadow-md">
                  <Rocket className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-primary mb-2">Our Mission</h3>
                  <p className="text-slate-700 text-sm sm:text-base leading-relaxed max-w-xl">
                    To deliver industrial-strength, modern IT solutions that simplify complex business challenges, enabling our clients to achieve unparalleled efficiency and sustainable growth in a digital-first world.
                  </p>
                </div>
              </div>
              <div className="relative z-10 flex items-center gap-2 text-xs font-bold text-brand-blue uppercase tracking-wider">
                <Target className="w-4 h-4 text-action-orange" /> Focus • Execution • Results
              </div>
            </div>

            {/* Value 1: Excellence */}
            <div className="col-span-1 row-span-1 bg-surface rounded-3xl p-8 border border-slate-200/80 flex flex-col justify-center items-center text-center hover:shadow-lg hover:border-brand-blue/30 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-action-orange flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Award className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-display font-bold text-primary mb-1.5">Excellence</h4>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xs">
                Unyielding quality standards in every hardware deployment and line of code.
              </p>
            </div>

            {/* Value 2: Innovation */}
            <div className="col-span-1 row-span-1 bg-surface rounded-3xl p-8 border border-slate-200/80 flex flex-col justify-center items-center text-center hover:shadow-lg hover:border-brand-blue/30 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-brand-blue flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Lightbulb className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-display font-bold text-primary mb-1.5">Innovation</h4>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xs">
                Continuous technology evolution to keep our enterprise clients ahead of the curve.
              </p>
            </div>

            {/* Value 3: Integrity */}
            <div className="col-span-1 row-span-1 bg-surface rounded-3xl p-8 border border-slate-200/80 flex flex-col justify-center items-center text-center hover:shadow-lg hover:border-brand-blue/30 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Handshake className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-display font-bold text-primary mb-1.5">Integrity</h4>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xs">
                Transparent partnerships and honest SLAs built on deep professional trust.
              </p>
            </div>

            {/* Vision Card */}
            <div className="col-span-1 lg:col-span-1 row-span-1 bg-surface-deep text-white rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group shadow-xl">
              <div className="absolute inset-0 bg-brand-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md text-amber-300 flex items-center justify-center">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white">Our Vision</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  To be the globally recognized benchmark for technical reliability, precision engineering, and high-impact corporate partnerships.
                </p>
              </div>
              <p className="relative z-10 text-xs text-action-orange font-bold uppercase tracking-wider">
                Reliability • Precision • Trust
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TEAM & ENVIRONMENT */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 relative aspect-[4/3] rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-white p-3 group">
            <img
              src="https://nhxkqgwbiiaervkaeres.supabase.co/storage/v1/object/public/techbig/training&support.jpg"
              alt="TechBigSolutions Training and Support Culture"
              className="rounded-2xl w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-xs font-bold uppercase tracking-wider">
              Culture of Mastery
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-primary">
              Built by Experts, For Modern Enterprises
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Our workplace thrives on technical curiosity, rigorous quality assurance, and continuous cross-functional collaboration. We invest heavily in our team&apos;s capabilities so they can solve your hardest architectural bottlenecks.
            </p>

            <ul className="space-y-3.5 pt-2">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base font-medium text-slate-800">
                  Continuous multi-vendor certifications (AWS, Microsoft, Cisco, Linux).
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base font-medium text-slate-800">
                  High-speed testing labs for enterprise stress tests and network simulations.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base font-medium text-slate-800">
                  Sustainable, compliant, and scalable IT infrastructure practices.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-blue text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-action-orange/0 via-action-orange to-action-orange/0" />
        <div className="max-w-3xl mx-auto relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-display font-bold">
            Ready to Elevate Your Infrastructure?
          </h2>
          <p className="text-base sm:text-lg text-blue-100">
            Partner with TechBigSolutions to build the robust tech stack your enterprise deserves. Let&apos;s discuss your next phase of growth.
          </p>
          <div className="pt-2">
            <button
              onClick={() => openQuoteModal()}
              className="inline-flex items-center gap-2 bg-action-orange hover:bg-secondary-container text-white px-8 py-4 rounded-xl font-bold text-sm shadow-xl transition-all hover:scale-105 active:scale-95 group"
            >
              <span>Contact Us Today</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
