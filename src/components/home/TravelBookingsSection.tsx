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
  Sparkles,
  Phone,
  ArrowRight,
  CreditCard,
  Percent,
  Headphones,
  Users
} from "lucide-react";
import { useQuoteModal } from "@/context/QuoteModalContext";

export function TravelBookingsSection() {
  const { openQuoteModal } = useQuoteModal();

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-blue-50/50 via-white to-surface-container-low border-b border-slate-200" id="travel-bookings">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold uppercase tracking-wider">
            {/* <Sparkles className="w-4 h-4 text-action-orange" /> */}
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

        {/* 4 Trust Badges from Poster */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 text-center shadow-sm">
            <ShieldCheck className="w-6 h-6 text-brand-blue mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-900">Safe & Secure Bookings</p>
            <p className="text-[11px] text-slate-500">100% verified ticketing</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 text-center shadow-sm">
            <Percent className="w-6 h-6 text-action-orange mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-900">Best Prices Guaranteed</p>
            <p className="text-[11px] text-slate-500">Exclusive discounts</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 text-center shadow-sm">
            <Headphones className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-900">24/7 Customer Support</p>
            <p className="text-[11px] text-slate-500">Live booking assistance</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 text-center shadow-sm">
            <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-900">Instant Confirmation</p>
            <p className="text-[11px] text-slate-500">Direct SMS & WhatsApp</p>
          </div>
        </div>

        {/* 3 Core Travel Services Grid (From Poster 3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Card 1: Flight Ticket Booking */}
          <div className="bg-white rounded-3xl border border-slate-200 p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 group hover:border-blue-400">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <Plane className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  Airlines
                </span>
              </div>

              <h3 className="text-xl font-display font-bold text-primary mb-1">
                Flight Ticket Booking
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                All Major Airlines • Best Fares • Easy Booking
              </p>

              <div className="space-y-3 border-t border-slate-100 pt-5 mb-6">
                <div className="flex items-start gap-3 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-semibold">Domestic Flight Ticket Booking</strong>
                    <span className="text-slate-500">Indigo, Air India, SpiceJet & Akasa with lowest cancellation fees.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-semibold">International Flight Ticket Booking</strong>
                    <span className="text-slate-500">Global itineraries, transit visa assistance & group discounts.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-semibold">Corporate & Group Fares</strong>
                    <span className="text-slate-500">Special corporate concession codes and flexible reschedule options.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => openQuoteModal("Flight Ticket Booking")}
                className="w-full bg-blue-50 hover:bg-brand-blue hover:text-white text-brand-blue py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <span>Book Flight Tickets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Train Ticket Booking */}
          <div className="bg-white rounded-3xl border border-slate-200 p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 group hover:border-emerald-400">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                  <Train className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  Railways
                </span>
              </div>

              <h3 className="text-xl font-display font-bold text-primary mb-1">
                Train Ticket Booking
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                All Classes • Tatkal Booking • Instant Confirmation
              </p>

              <div className="space-y-3 border-t border-slate-100 pt-5 mb-6">
                <div className="flex items-start gap-3 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-semibold">Local Train Ticket Booking</strong>
                    <span className="text-slate-500">Daily express & regional passenger tickets with zero counter queue.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-semibold">National Train Ticket Booking</strong>
                    <span className="text-slate-500">Vande Bharat, Rajdhani, Shatabdi across all berths & AC tiers.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-semibold">Emergency Tatkal & Premium Tatkal</strong>
                    <span className="text-slate-500">Dedicated assistance for urgent peak-season travel confirmations.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => openQuoteModal("Train Ticket Booking (Tatkal / Regular)")}
                className="w-full bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <span>Book Train / Tatkal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: Tirupati Temple Visit Booking */}
          <div className="bg-white rounded-3xl border-2 border-action-orange/40 p-7 sm:p-8 flex flex-col justify-between shadow-md hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
            <span className="absolute top-4 right-4 bg-action-orange text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
              Popular Seva
            </span>

            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-action-orange flex items-center justify-center group-hover:scale-105 group-hover:bg-action-orange group-hover:text-white transition-all duration-300">
                  <Landmark className="w-7 h-7" />
                </div>
              </div>

              <h3 className="text-xl font-display font-bold text-primary mb-1">
                Tirupati Temple Visit Booking
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Hassle-Free Darshan • Confirmed Booking
              </p>

              <div className="space-y-3 border-t border-slate-100 pt-5 mb-6">
                <div className="flex items-start gap-3 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-action-orange shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-semibold">Tirupati Darshan Online Booking</strong>
                    <span className="text-slate-500">Official slot booking assistance with verified devotee details.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-action-orange shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-semibold">Special Entry Darshan (₹300 / VIP)</strong>
                    <span className="text-slate-500">Confirmed quick-access passes for effortless family temple darshan.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-action-orange shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-semibold">Accommodation & Seva Tickets</strong>
                    <span className="text-slate-500">Tirumala cottages, guesthouse reservation & morning Suprabhatha Seva.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => openQuoteModal("Tirupati Temple Darshan Booking")}
                className="w-full bg-action-orange hover:bg-orange-600 text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span>Book Tirupati Darshan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Location & Contact Strip from Poster 3 */}
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
