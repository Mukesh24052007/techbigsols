"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Phone, Mail, MapPin, MessageSquare } from "lucide-react";

interface CtaBannerSectionProps {
  onOpenQuoteModal: () => void;
}

export function CtaBannerSection({ onOpenQuoteModal }: CtaBannerSectionProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-blue text-white text-center relative overflow-hidden">
      {/* Decorative accents */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-action-orange/0 via-action-orange to-action-orange/0" />
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/15 rounded-full text-xs font-semibold uppercase tracking-wider">
          Empowering Careers • Delivering Futures
        </div>
        <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight">
          Ready to Start Your SAP Career or Need Immediate IT Support?
        </h2>
        <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
          Contact TechBig Solutions today. Talk directly to our career advisors, hardware specialists, or travel desk.
        </p>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onOpenQuoteModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-action-orange hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-sm shadow-xl transition-all hover:scale-105 active:scale-95 group"
          >
            <span>Request Free Consultation</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <a
            href="https://wa.me/918122196279?text=Hello%20TechBig%20Solutions,%20I%20would%20like%20to%20inquire%20about%20your%20services."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-4 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp: 8122196279</span>
          </a>
          <a
            href="tel:8122196279"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-7 py-4 rounded-xl font-bold text-sm border border-white/20 transition-all active:scale-95"
          >
            <Phone className="w-4 h-4 text-amber-300" />
            <span>Call: 8122196279</span>
          </a>
        </div>

        {/* Quick Contact Info Strip */}
        <div className="pt-8 border-t border-white/15 flex flex-wrap items-center justify-center gap-6 text-xs text-blue-100">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-300" />
            <a href="mailto:techbigsolutions@gmail.com" className="hover:underline">
              techbigsolutions@gmail.com
            </a>
          </div>
          <span className="hidden sm:inline opacity-40">•</span>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-300" />
            <span>Ambattur, Chennai</span>
          </div>
          <span className="hidden sm:inline opacity-40">•</span>
          <div className="flex items-center gap-2">
            <span>Website: <strong>techbigsolutions.in</strong></span>
          </div>
        </div>
      </div>
    </section>
  );
}
