"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Server, Users, GraduationCap, TrendingUp } from "lucide-react";

export function CoreExpertiseSection() {
  return (
    <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full" id="services">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-xs font-bold uppercase tracking-wider">
          Comprehensive Capabilities
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-primary">
          Our Core Expertise
        </h2>
        <p className="text-base sm:text-lg text-slate-600">
          Tailored enterprise solutions engineered to scale your operations, secure your infrastructure, and optimize organizational efficiency.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[320px]">
        {/* Bento Item 1: Recruitment & HR (Span 8) */}
        <div className="col-span-1 md:col-span-8 relative rounded-2xl overflow-hidden group shadow-md hover:shadow-xl transition-all duration-500 border border-slate-200">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage: `url('https://nhxkqgwbiiaervkaeres.supabase.co/storage/v1/object/public/techbig/recruitment&hr-services.jpg')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-deep/95 via-surface-deep/60 to-transparent" />
          <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end text-white z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold w-max mb-3">
              <Users className="w-3.5 h-3.5 text-action-orange" />
              <span>Talent Acquisition</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-bold mb-2">
              Recruitment & HR Services
            </h3>
            <p className="text-sm sm:text-base text-slate-200 max-w-xl mb-4 leading-relaxed">
              Building high-performance teams with targeted talent acquisition, executive search, and end-to-end HR compliance.
            </p>
            <Link
              href="/services#recruitment-hr"
              className="inline-flex items-center gap-2 text-action-orange font-bold text-sm hover:text-white transition-colors group-hover:translate-x-1 duration-300"
            >
              <span>Learn more</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Bento Item 2: IT Services (Span 4) */}
        <div className="col-span-1 md:col-span-4 relative rounded-2xl overflow-hidden group bg-surface-container-low border border-slate-200 p-8 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-500 hover:border-brand-blue/50">
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-action-orange/15 text-action-orange flex items-center justify-center">
              <Server className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-display font-bold text-primary">
              System Sales & IT Services
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Enterprise hardware deployment, managed IT infrastructure, proactive cloud migrations, and cybersecurity.
            </p>
          </div>
          <Link
            href="/services#it-services"
            className="relative z-10 text-brand-blue font-bold text-sm flex items-center gap-1.5 group-hover:gap-3 transition-all"
          >
            <span>Explore Infrastructure</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Bento Item 3: Business Consulting (Span 5) */}
        <div className="col-span-1 md:col-span-5 relative rounded-2xl overflow-hidden group bg-brand-blue text-white p-8 flex flex-col justify-between shadow-md hover:shadow-xl transition-all duration-500">
          <div className="relative z-10 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-300" />
            </div>
            <h3 className="text-xl sm:text-2xl font-display font-bold">
              Business Consulting
            </h3>
            <p className="text-sm text-blue-100 leading-relaxed">
              Strategic digital transformation roadmaps, process optimization, and tech stack auditing to eliminate inefficiencies.
            </p>
          </div>
          <Link
            href="/services#business-consulting"
            className="relative z-10 text-white font-bold text-sm flex items-center gap-1.5 group-hover:gap-3 transition-all"
          >
            <span>Consult with experts</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Bento Item 4: Training & Support (Span 7) */}
        <div className="col-span-1 md:col-span-7 relative rounded-2xl overflow-hidden group bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-12 h-full">
            <div className="sm:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-primary">
                  Training & Support
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Empowering your workforce with continuous technology upskilling, workflow adoption, and 24/7 technical helpdesk assistance.
                </p>
              </div>
              <Link
                href="/services#training-support"
                className="text-brand-blue font-bold text-sm flex items-center gap-1.5 group-hover:gap-3 transition-all mt-4"
              >
                <span>Discover training</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="sm:col-span-5 relative min-h-[160px] sm:min-h-full">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `url('https://nhxkqgwbiiaervkaeres.supabase.co/storage/v1/object/public/techbig/training&support.jpg')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-l from-transparent to-white/30" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
