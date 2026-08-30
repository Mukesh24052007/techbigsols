"use client";

import React from "react";
import Link from "next/link";
import { servicesData } from "@/data/services";
import { useQuoteModal } from "@/context/QuoteModalContext";
import {
  Users,
  Server,
  GraduationCap,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
  PhoneCall,
  Sparkles
} from "lucide-react";

export default function ServicesPage() {
  const { openQuoteModal } = useQuoteModal();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Users":
        return <Users className="w-5 h-5 text-brand-blue" />;
      case "Server":
        return <Server className="w-5 h-5 text-brand-blue" />;
      case "GraduationCap":
        return <GraduationCap className="w-5 h-5 text-brand-blue" />;
      case "TrendingUp":
        return <TrendingUp className="w-5 h-5 text-brand-blue" />;
      default:
        return <Sparkles className="w-5 h-5 text-brand-blue" />;
    }
  };

  return (
    <main className="flex-1 w-full bg-surface">
      {/* 1. Services Hero */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-surface-container-low border-b border-slate-200/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-xs font-bold uppercase tracking-wider">
            Enterprise Solutions & IT Strategy
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-primary">
            Our Core Services
          </h1>
          <p className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Empowering your business to scale and optimize through tailored technology solutions, expert consulting, talent recruitment, and robust operational support.
          </p>
        </div>
      </section>

      {/* 2. Services Alternating Grid */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-24 lg:space-y-32">
        {servicesData.map((service, index) => {
          const isEven = index % 2 === 1;

          return (
            <div
              key={service.id}
              id={service.id}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center scroll-mt-28`}
            >
              {/* Image Column */}
              <div
                className={`lg:col-span-5 ${
                  isEven ? "lg:order-2" : "lg:order-1"
                }`}
              >
                <div className="relative rounded-3xl p-2.5 bg-white border border-slate-200/80 shadow-xl group hover:shadow-2xl transition-all duration-500">
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-surface-container-low">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-deep/40 via-transparent to-transparent pointer-events-none" />
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Enterprise Grade SLA
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-brand-blue">
                      Custom Engagement
                    </span>
                  </div>
                </div>
              </div>

              {/* Text / Content Column */}
              <div
                className={`lg:col-span-7 ${
                  isEven ? "lg:order-1 lg:pr-8" : "lg:order-2 lg:pl-8"
                } space-y-6`}
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20">
                  {getIcon(service.iconName)}
                  <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">
                    {service.category}
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-primary">
                  {service.title}
                </h2>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                  {service.description}
                </p>

                {/* Key Points Bullet List */}
                <div className="space-y-3 pt-2">
                  {service.keyPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-action-orange flex-shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base font-medium text-slate-800">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Detailed Features */}
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

                {/* CTA Buttons */}
                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => openQuoteModal(service.title)}
                    className="inline-flex items-center gap-2 bg-brand-blue hover:bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
                  >
                    <span>{service.ctaLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => openQuoteModal(service.title)}
                    className="inline-flex items-center gap-2 border border-slate-300 hover:border-brand-blue text-slate-700 hover:text-brand-blue px-6 py-3 rounded-xl font-semibold text-sm transition-all"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Talk to an Architect</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. Bottom Consultation CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-deep text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-display font-bold">
            Need a Customized Multi-Service Package?
          </h2>
          <p className="text-slate-300 text-base max-w-2xl mx-auto">
            We can bundle hardware deployment, cloud migration, employee upskilling, and permanent technical recruitment under a unified master agreement.
          </p>
          <div className="pt-2">
            <button
              onClick={() => openQuoteModal("Enterprise Bundle")}
              className="inline-flex items-center gap-2 bg-action-orange hover:bg-secondary-container text-white px-8 py-4 rounded-xl font-bold text-sm shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <span>Schedule Enterprise Discovery Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
