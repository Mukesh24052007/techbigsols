"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Rocket } from "lucide-react";

interface HeroSectionProps {
  onOpenQuoteModal: () => void;
}

export function HeroSection({ onOpenQuoteModal }: HeroSectionProps) {
  return (
    <section className="relative w-full min-h-[640px] lg:min-h-[700px] flex items-center bg-surface-deep overflow-hidden">
      {/* Background Gradients & Mesh */}
      <div className="absolute inset-0 bg-radial-gradient from-brand-blue/20 via-surface-deep to-surface-deep pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-blue/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-action-orange/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            {/* Badge */}
            {/* <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-action-orange animate-ping" />
              <span>Next-Gen Enterprise Solutions</span>
            </div> */}

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-surface-bright tracking-tight leading-[1.15]">
              Empowering Businesses Through{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-amber-300">
                Innovative Solutions
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-surface-variant/90 max-w-2xl font-normal leading-relaxed">
              We deliver robust technology frameworks, enterprise IT infrastructure, and strategic consulting to drive your business forward in a digital-first world.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 bg-brand-blue hover:bg-primary text-white px-8 py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-brand-blue/30 transition-all hover:scale-[1.02] active:scale-95"
              >
                <span>Explore Services</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={onOpenQuoteModal}
                className="inline-flex items-center justify-center gap-2 border-2 border-action-orange text-action-orange hover:bg-action-orange hover:text-white px-8 py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-95"
              >
                <span>Schedule Consultation</span>
              </button>
            </div>

            {/* Metrics Bar */}
            {/* <div className="pt-6 border-t border-slate-800 grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <p className="text-2xl sm:text-3xl font-bold font-display text-white">150+</p>
                <p className="text-xs text-slate-400 font-medium">Enterprise Clients</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold font-display text-action-orange">99.9%</p>
                <p className="text-xs text-slate-400 font-medium">Infrastructure SLA</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold font-display text-white">24/7</p>
                <p className="text-xs text-slate-400 font-medium">Helpdesk Support</p>
              </div>
            </div> */}
          </div>

          {/* Right Hero Image Card */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            <div className="relative w-full max-w-md bg-gradient-to-tr from-white/10 to-white/5 p-4 sm:p-6 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-xl group hover:border-brand-blue/40 transition-all duration-500">
              <div className="relative rounded-2xl overflow-hidden bg-surface-deep/60 flex items-center justify-center p-4">
                <img
                  src="https://techbigsolutions.in/hero.png"
                  alt="Saraswati - Symbol of Wisdom and Innovation"
                  className="max-h-[380px] sm:max-h-[440px] w-auto object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-deep/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/20 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wider">Wisdom & Technology</p>
                    <p className="text-[11px] text-slate-300">Guiding Indian & Global Enterprises</p>
                  </div>
                  <span className="w-8 h-8 rounded-lg bg-action-orange text-white flex items-center justify-center">
                    <Rocket className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
