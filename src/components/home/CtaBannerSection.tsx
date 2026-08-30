"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CtaBannerSectionProps {
  onOpenQuoteModal: () => void;
}

export function CtaBannerSection({ onOpenQuoteModal }: CtaBannerSectionProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-blue text-white text-center relative overflow-hidden">
      {/* Decorative accents */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-action-orange/0 via-action-orange to-action-orange/0" />
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 rounded-full text-xs font-semibold uppercase tracking-wider">
          Ready to Take the Next Step?
        </div>
        <h2 className="text-3xl sm:text-5xl font-display font-extrabold">
          Ready to Elevate Your Business Infrastructure?
        </h2>
        <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto">
          Partner with TechBigSolutions to build the robust, scalable tech stack your enterprise deserves. Let&apos;s discuss your next big milestone.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onOpenQuoteModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-action-orange hover:bg-secondary-container text-white px-8 py-4 rounded-xl font-bold text-sm shadow-xl transition-all hover:scale-105 active:scale-95 group"
          >
            <span>Contact Us Today</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <Link
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold text-sm border border-white/20 transition-all"
          >
            <span>View Office Locations</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
