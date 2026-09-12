"use client";

import React from "react";
import Link from "next/link";
import {
  Plane,
  Train,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Phone,
  ArrowRight,
  Percent,
  Headphones,
} from "lucide-react";
import { useQuoteModal } from "@/context/QuoteModalContext";
import {
  travelTrustBadges,
  travelServices,
  type TravelTrustBadge,
  type TravelService,
} from "@/data/travel";

const travelTrustIconMap: Record<string, React.ElementType> = {
  ShieldCheck,
  Percent,
  Headphones,
  Clock,
};

const travelServiceIconMap: Record<string, React.ElementType> = {
  Plane,
  Train,
  Landmark,
};

const travelCheckIconColorMap: Record<string, string> = {
  flight: "text-emerald-600",
  train: "text-emerald-600",
  tirupati: "text-action-orange",
};

export function TravelBookingsSection() {
  const { openQuoteModal } = useQuoteModal();

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-blue-50/50 via-white to-surface-container-low border-b border-slate-200" id="travel-bookings">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold uppercase tracking-wider">
            <span>Your Journey, Our Responsibility!</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-primary">
            Ticket Bookings Made Easy!{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-action-orange">
              Travel Hassle-Free
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            All your travel needs under one destination. Guaranteed best fares, instant confirmation, Tatkal train reservations, and confirmed Tirupati Darshan seva passes.
          </p>
        </div>

        {/* 4 Trust Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
          {travelTrustBadges.map((badge: TravelTrustBadge) => {
            const IconComp = travelTrustIconMap[badge.iconName] ?? ShieldCheck;
            return (
              <div key={badge.title} className="bg-white p-4 rounded-xl border border-slate-200/80 text-center shadow-sm">
                <IconComp className={`w-6 h-6 ${badge.iconColor} mx-auto mb-2`} />
                <p className="text-xs font-bold text-slate-900">{badge.title}</p>
                <p className="text-[11px] text-slate-500">{badge.subtitle}</p>
              </div>
            );
          })}
        </div>

        {/* 3 Core Travel Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {travelServices.map((service: TravelService) => {
            const IconComp = travelServiceIconMap[service.iconName] ?? Plane;
            const checkColor = travelCheckIconColorMap[service.id] ?? "text-emerald-600";

            return (
              <div
                key={service.id}
                className={`bg-white rounded-3xl p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden ${
                  service.featured
                    ? "border-2 border-action-orange/40 shadow-md"
                    : `border border-slate-200 hover:${service.id === "flight" ? "border-blue-400" : "border-emerald-400"}`
                }`}
              >
                {service.featured && (
                  <span className="absolute top-4 right-4 bg-action-orange text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                    Popular Seva
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-all duration-300 ${service.iconBgClass} ${service.iconHoverBgClass}`}>
                      <IconComp className="w-7 h-7" />
                    </div>
                    {!service.featured && (
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${service.badgeClass}`}>
                        {service.badgeLabel}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-display font-bold text-primary mb-1">
                    {service.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-6">{service.tagline}</p>

                  <div className="space-y-3 border-t border-slate-100 pt-5 mb-6">
                    {service.points.map((point) => (
                      <div key={point.title} className="flex items-start gap-3 text-xs text-slate-700">
                        <CheckCircle2 className={`w-4 h-4 ${checkColor} shrink-0 mt-0.5`} />
                        <div>
                          <strong className="text-slate-900 block font-semibold">{point.title}</strong>
                          <span className="text-slate-500">{point.detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => openQuoteModal(service.ctaQuoteLabel)}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${service.ctaClass}`}
                  >
                    <span>{service.ctaLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Location & Contact Strip */}
        <div className="bg-brand-blue text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="space-y-1 text-center md:text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
              OUR SERVICE LOCATIONS: AMBATTUR
            </p>
            <h4 className="text-xl sm:text-2xl font-display font-extrabold">
              Pack Your Bags, We&apos;ll Handle the Rest!
            </h4>
            <p className="text-xs sm:text-sm text-blue-100">
              Multiple Payment Options • Exclusive Travel Offers • Dedicated 24/7 Booking Desk
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              href="/services#travel-bookings"
              className="bg-white text-brand-blue hover:bg-blue-50 px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <span>Full Travel & Darshan Details</span>
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
              onClick={() => openQuoteModal("Travel Ticket Booking")}
              className="bg-action-orange hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <span>Book Tickets Online</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
