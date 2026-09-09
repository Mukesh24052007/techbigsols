import React from "react";
import { ShieldCheck } from "lucide-react";

/**
 * Thin top-of-page trust bar that surfaces the company's GST registration
 * prominently. Sits just below the Navbar so it's the first line of content
 * a visitor reads — high contrast on the dark surface-deep background.
 */
export function GstinBar() {
  return (
    <div className="w-full bg-surface-deep border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-1 sm:gap-4">

        {/* Left — company legal identity */}
        <p className="text-[11px] text-slate-400 font-medium tracking-wide text-center sm:text-left">
          TechBig Solutions Consulting Services — Registered Business, Ambattur, Chennai
        </p>

        {/* Right — GSTIN badge */}
        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-brand-blue/20 border border-brand-blue/40 text-white">
          <ShieldCheck className="w-3.5 h-3.5 text-action-orange shrink-0" />
          <span className="text-xs font-semibold text-slate-300 tracking-wide">GSTIN</span>
          <span className="h-3 w-px bg-white/20" />
          <span className="text-sm font-mono font-bold text-white tracking-widest">
            33BCCPM5639JIZH
          </span>
        </div>

      </div>
    </div>
  );
}
