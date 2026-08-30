"use client";

import React from "react";
import { ShieldCheck, Zap, Clock } from "lucide-react";

export function WhyChooseUsSection() {
  return (
    <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left: Text Content */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-xs font-bold uppercase tracking-wider">
            The Enterprise Edge
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-primary">
            Why Industry Leaders Partner With TechBigSolutions
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            We combine deep technical mastery with proactive consulting to design, implement, and maintain resilient business ecosystems.
          </p>

          {/* Feature Cards */}
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Zero-Compromise Security & SLAs</h4>
                <p className="text-xs text-slate-500 mt-0.5">Enterprise encryption, proactive monitoring, and strict SLAs for continuous operations.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-brand-blue flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Rapid Deployment & Turnkey Setup</h4>
                <p className="text-xs text-slate-500 mt-0.5">Fast workstation rollouts, seamless cloud migrations, and immediate staffing pipelines.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-action-orange flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">24/7 Dedicated Multi-Tier Support</h4>
                <p className="text-xs text-slate-500 mt-0.5">Direct access to certified network engineers and solution architects around the clock.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Image */}
        <div className="relative">
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-2xl bg-white p-3">
            <img
              src="https://nhxkqgwbiiaervkaeres.supabase.co/storage/v1/object/public/techbig/SystemSales&IT-services.jpg"
              alt="TechBigSolutions Office and Systems"
              className="rounded-2xl w-full h-[400px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-deep/80 via-transparent to-transparent rounded-2xl pointer-events-none" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <p className="text-xs uppercase font-bold text-action-orange tracking-wider">Proven Track Record</p>
              <p className="text-lg font-bold font-display mt-1">Transforming operations for 150+ high-growth companies across India & abroad.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
