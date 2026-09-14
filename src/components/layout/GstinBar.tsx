"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { PngFlagIcon } from "@/components/ui/PngFlagIcon";

/**
 * Thin top-of-page trust bar that surfaces the company's legal registration
 * and international presence prominently. Sits just below the Navbar.
 */
export function GstinBar() {
  const setIntlHighlight = (active: boolean) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("highlight-intl-branch", { detail: active }));
    }
  };

  const scrollToHeroIntl = () => {
    const el = document.getElementById("hero-intl-branch");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setIntlHighlight(true);
      setTimeout(() => setIntlHighlight(false), 2000);
    }
  };

  return (
    <div className="w-full bg-surface-deep border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex flex-col md:flex-row items-center justify-between gap-2">

        {/* Left — company legal identity */}
        <p className="text-[11px] text-slate-400 font-medium tracking-wide text-center md:text-left">
          TechBig Solutions Consulting Services — Registered Business, Ambattur, Chennai
        </p>

        {/* Right — Dual Badges: International Branch + GSTIN */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          {/* Intl Branch Badge with hover highlight */}
          <button
            type="button"
            onMouseEnter={() => setIntlHighlight(true)}
            onMouseLeave={() => setIntlHighlight(false)}
            onClick={scrollToHeroIntl}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/15 hover:border-action-orange/60 text-white transition-all cursor-pointer group shadow-sm"
            title="Hover or click to highlight Papua New Guinea International Branch"
          >
            <PngFlagIcon className="w-4 h-2.5" />
            <span className="text-[10px] font-bold text-action-orange uppercase tracking-wider">
              Intl Branch:
            </span>
            <span className="text-[11px] font-semibold text-slate-200 group-hover:text-amber-200 transition-colors">
              Papua New Guinea
            </span>
          </button>

          {/* GSTIN badge */}
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-brand-blue/20 border border-brand-blue/40 text-white">
            <ShieldCheck className="w-3.5 h-3.5 text-action-orange shrink-0" />
            <span className="text-xs font-semibold text-slate-300 tracking-wide">GSTIN</span>
            <span className="h-3 w-px bg-white/20" />
            <span className="text-xs sm:text-sm font-mono font-bold text-white tracking-widest">
              33BCCPM5639JIZH
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

