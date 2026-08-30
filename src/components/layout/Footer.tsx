"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import { useQuoteModal } from "@/context/QuoteModalContext";
import { Layers, Mail, Phone, MapPin, Send, ArrowRight, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  const { showToast } = useToast();
  const { openQuoteModal } = useQuoteModal();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    showToast("Subscribed! You will receive tech & business insights.", "success");
    setEmail("");
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="bg-surface-deep text-white border-t border-slate-800 relative overflow-hidden">
      {/* Decorative top ambient light */}
      <div className="absolute top-0 left-1/4 w-96 h-32 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-action-orange/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-800">
          {/* Brand Col (2 spans on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center group">
              <img
                src="/logo.png"
                alt="TechBigSolutions"
                className="h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </Link>
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
              Empowering businesses through innovative technology solutions, strategic consulting, and robust operational support.
            </p>

            <div className="space-y-2 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-action-orange flex-shrink-0" />
                <span>Indiranagar Tech Hub, Bangalore, Karnataka, India</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-action-orange flex-shrink-0" />
                <span>+91 80 4123 4567 / +91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-action-orange flex-shrink-0" />
                <span>contact@techbigsolutions.in</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-surface-bright border-b border-slate-800 pb-2">
              Solutions
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/services#recruitment-hr" className="text-slate-300 hover:text-white hover:underline decoration-action-orange underline-offset-4 transition-all">
                  Recruitment & HR
                </Link>
              </li>
              <li>
                <Link href="/services#it-services" className="text-slate-300 hover:text-white hover:underline decoration-action-orange underline-offset-4 transition-all">
                  System Sales & IT
                </Link>
              </li>
              <li>
                <Link href="/services#training-support" className="text-slate-300 hover:text-white hover:underline decoration-action-orange underline-offset-4 transition-all">
                  Training & Support
                </Link>
              </li>
              <li>
                <Link href="/services#business-consulting" className="text-slate-300 hover:text-white hover:underline decoration-action-orange underline-offset-4 transition-all">
                  Business Consulting
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-slate-300 hover:text-white hover:underline decoration-action-orange underline-offset-4 transition-all">
                  Hardware & Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-surface-bright border-b border-slate-800 pb-2">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="text-slate-300 hover:text-white hover:underline decoration-action-orange underline-offset-4 transition-all">
                  About Our Mission
                </Link>
              </li>
              <li>
                <Link href="/about#values" className="text-slate-300 hover:text-white hover:underline decoration-action-orange underline-offset-4 transition-all">
                  Core Values
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-300 hover:text-white hover:underline decoration-action-orange underline-offset-4 transition-all">
                  Contact Support
                </Link>
              </li>
              <li>
                <button
                  onClick={() => openQuoteModal()}
                  className="text-action-orange font-semibold hover:underline decoration-action-orange underline-offset-4 transition-all text-left"
                >
                  Request Consultation
                </button>
              </li>
              <li>
                <Link href="/contact#faq" className="text-slate-300 hover:text-white hover:underline decoration-action-orange underline-offset-4 transition-all">
                  Knowledge Base & FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-surface-bright border-b border-slate-800 pb-2">
              Stay Connected
            </h3>
            <p className="text-xs text-slate-300">
              Receive quarterly technology briefings, architecture whitepapers, and hardware updates.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Enter work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-action-orange"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-3 bg-action-orange text-white rounded-md text-xs font-semibold hover:bg-secondary-container transition-colors flex items-center justify-center"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              {subscribed && (
                <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Thank you for subscribing!
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom copyright & legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} TechBigSolutions. Empowering business through innovation. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/contact" className="hover:text-surface-bright hover:underline decoration-action-orange underline-offset-4 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-surface-bright hover:underline decoration-action-orange underline-offset-4 transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-surface-bright hover:underline decoration-action-orange underline-offset-4 transition-colors">
              Cookie Policy
            </Link>
            <Link href="/contact" className="hover:text-surface-bright hover:underline decoration-action-orange underline-offset-4 transition-colors">
              Security & SLA
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
