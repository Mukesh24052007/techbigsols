"use client";

import React from "react";
import { ShieldCheck, Award, Wrench, Clock, MapPin, Phone } from "lucide-react";
import { whyChooseFeatures, type WhyChooseFeature } from "@/data/whyChooseUs";

const featureIconMap: Record<string, React.ElementType> = {
  Award,
  ShieldCheck,
  Wrench,
  Clock,
};

export function WhyChooseUsSection() {
  return (
    <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left: Text Content */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-xs font-bold uppercase tracking-wider">
            Why Choose Us?
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-primary leading-tight">
            Built on Enterprise Excellence & Client Trust
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Whether you are advancing your tech career with certified SAP & software skills, repairing critical workstations, or planning seamless travel — TechBig Solutions delivers unmatched quality, transparency, and personal care.
          </p>

          {/* Feature Cards */}
          <div className="space-y-4 pt-2">
            {whyChooseFeatures.map((feature: WhyChooseFeature) => {
              const IconComp = featureIconMap[feature.iconName] ?? ShieldCheck;
              return (
                <div
                  key={feature.title}
                  className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${feature.iconBg}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{feature.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Dual Location Card & Quick Action */}
        <div className="space-y-6">
          <div className="bg-surface-deep text-white p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-action-orange/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-amber-300 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" />
                <span>Our Regional Centers</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                Serving Businesses & Learners Across Chennai
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                  <h4 className="text-base font-bold text-action-orange mb-1">Center</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Industrial corridor hub catering to manufacturing, logistics ERP, and enterprise technical training.
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                  <h4 className="text-base font-bold text-action-orange mb-1">Ambattur Center</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    IT Park & commercial zone hub providing hands-on hardware care, student training & walk-in ticketing desk.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400">Direct Support Helpline</p>
                  <p className="text-lg font-bold text-white">(+91) 8122196279</p>
                </div>
                <a
                  href="tel:8122196279"
                  className="w-full sm:w-auto bg-action-orange hover:bg-orange-600 text-white text-xs font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Us Now</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
